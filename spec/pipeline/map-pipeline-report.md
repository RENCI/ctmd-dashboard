# Map Pipeline Service Report

## Overview

The `map-pipeline` is a Scala-based Apache Spark data transformation pipeline that transforms REDCap clinical trial data into a structured database format. It processes raw JSON data according to mapping configurations, applies filters and transformations, and outputs CSV files ready for database ingestion.

**Location:** `services/pipeline/map-pipeline/`

**Primary Purpose:** Transform REDCap clinical trial data from source format to normalized database tables based on mapping definitions

## Architecture

### Technology Stack

- **Language:** Scala 2.11.8
- **Build System:** SBT (Simple Build Tool) 1.2.4
- **Build Plugin:** sbt-assembly 0.14.9
- **Data Processing Framework:** Apache Spark 2.3.2
- **Additional Languages:** Python (wrapper scripts)

### Dependencies

```scala
libraryDependencies += "org.apache.spark" %% "spark-sql" % "2.3.2"
libraryDependencies += "com.github.scopt" %% "scopt" % "4.0.0-RC2"          // CLI parser
libraryDependencies += "org.scala-lang.modules" %% "scala-parser-combinators" % "1.1.1"  // DSL parser
libraryDependencies += "org.dispatchhttp" %% "dispatch-core" % "1.0.0"       // HTTP client
```

### Service Components

```
map-pipeline/
├── src/
│   ├── main/
│   │   ├── scala/tic/
│   │   │   ├── DSL.scala           # Domain-Specific Language parsers
│   │   │   ├── GetData.scala       # REDCap data fetcher
│   │   │   ├── GetDataDict.scala   # REDCap data dictionary fetcher
│   │   │   ├── Transform.scala     # Main transformation logic
│   │   │   └── Utils.scala         # File I/O utilities
│   │   └── python/
│   │       ├── run.py              # Spark job submission wrapper
│   │       └── utils.py            # Spark submit helper
├── build.sbt                       # SBT build configuration
└── project/
    ├── build.properties            # SBT version
    └── assembly.sbt                # Assembly plugin config
```

## Core Modules

### 1. DSL.scala - Domain Specific Language

Provides custom parsers and transformation language for data mapping.

#### Abstract Syntax Tree (AST)

```scala
sealed trait AST
case object N_A extends AST                            // Not applicable/null value
case class Field(a:String) extends AST                 // Field reference
case class ExtractFirstName(a:AST) extends AST         // Parse first name
case class ExtractLastName(a:AST) extends AST          // Parse last name
case class GenerateID(a:Seq[AST]) extends AST          // Generate unique ID
case class If(a:AST,b:AST,c:AST) extends AST          // Conditional expression
case class Infix(a:AST,b:String,c:AST) extends AST    // Binary operator (/, =)
case class Lit(a:String) extends AST                   // Literal string
```

#### NameParser

Parses principal investigator (PI) names using combinator parsers. Supports multiple formats:

**Supported Name Formats:**
- `First Last` (fl)
- `First Middle Last` (fml)
- `Last, First` (lf)
- `Last` only (l)
- `Dr. <name>` prefix
- Special values: "unknown", "Pending"
- Titles: MD, M.D., PhD, MPH, MBBCH, MSCE

**Name Component Patterns:**
- First name: `[a-zA-Z]+[a-z]+` or initial `[a-zA-Z]\.?`
- Middle name: `(name)` or initial or name
- Last name: `[a-zA-Z]+[a-z]+` with optional hyphen

**Error Handling:**
Attempts multiple parsing strategies with fallback for:
- Hyphenated names (splits on `-`)
- Comma-separated (splits on `,`)
- Slash-separated (splits on `/`)
- "for" keyword (splits on `for`)

**Output:** `Seq[String]` with `[firstName, lastName]`
- Returns `[null, null]` for null input
- Returns `[null, input]` for unparseable input

**Location:** DSL.scala:25-151

#### MetadataParser

Parses REDCap dropdown/checkbox field metadata.

**Input Format:**
```
"1, Option One | 2, Option Two | 3_a, Option Three"
```

**Output:** `Seq[Choice]` where `Choice(index: String, description: String)`

**Location:** DSL.scala:156-175

#### DSLParser

Parses transformation expressions from mapping.json `Fieldname_redcap` column.

**Supported Operators:**
- `/` - Coalesce operator (use left if not null/empty, else right)
- `=` - Equality comparison

**Supported Functions:**
- `extract_first_name(field)` - Extract first name from field
- `extract_last_name(field)` - Extract last name from field
- `generate_ID(field1, field2, ...)` - Generate unique ID from fields
- `if condition then value else value` - Conditional expression

**Examples:**
```scala
"pi_firstname"                                    // Simple field reference
"pi_firstname / pi_lastname"                      // Use firstname, fallback to lastname
"extract_first_name(pi_name)"                     // Parse first name from full name
"generate_ID(pi_firstname,pi_lastname)"           // Generate ID from name components
"if pi_firstname = \"\" then \"Unknown\" else pi_firstname"  // Conditional
```

**Key Methods:**
- `apply(input: String): AST` - Parse DSL string to AST
- `eval(df: DataFrame, col: String, ast: AST): Column` - Evaluate AST to Spark Column
- `fields(ast: AST): Seq[String]` - Extract field dependencies from AST

**Location:** DSL.scala:177-272

### 2. GetData.scala - REDCap Data Fetcher

Fetches clinical trial records from REDCap API.

**Endpoint:** `https://redcap.vanderbilt.edu/api/`

**Request Parameters:**
```scala
Map(
  "token" -> token,                        // API authentication token
  "content" -> "record",                   // Fetch records
  "format" -> "json",                      // JSON output
  "type" -> "flat",                        // Flat format (no nesting)
  "rawOrLabel" -> "raw",                   // Raw values (not labels)
  "rawOrLabelHeaders" -> "raw",            // Raw headers
  "exportCheckboxLabel" -> "false",        // Export checkbox values, not labels
  "exportSurveyFields" -> "false",         // Don't export survey metadata
  "exportDataAccessGroups" -> "false",     // Don't export DAG
  "returnFormat" -> "json"                 // JSON response
)
```

**Method:**
```scala
def getData(token: String, output_file: String): Future[Unit]
```

**Output:** Writes JSON records to file asynchronously

**Location:** GetData.scala:1-45

### 3. GetDataDict.scala - REDCap Data Dictionary Fetcher

Fetches data dictionary (field metadata) from REDCap API.

**Endpoint:** `https://redcap.vanderbilt.edu/api/`

**Request Parameters:**
```scala
Map(
  "token" -> token,              // API authentication token
  "content" -> "metadata",       // Fetch metadata
  "format" -> "json",            // JSON output
  "returnFormat" -> "json"       // JSON response
)
```

**Method:**
```scala
def getDataDict(token: String, output_file: String): Future[Unit]
```

**Output:** Writes JSON metadata to file asynchronously

**Location:** GetDataDict.scala:1-35

### 4. Transform.scala - Main Transformation Engine

The core data transformation pipeline. Entry point for the Spark job.

#### Configuration

```scala
case class Config2(
  mappingInputFile: String = "",        // mapping.json path
  dataInputFile: String = "",           // REDCap records JSON
  dataDictInputFile: String = "",       // REDCap data dictionary JSON
  auxiliaryDir: String = "",            // Additional data to left join
  filterDir: String = "",               // Filter data (inner join)
  blocklistDir: String = "",            // Blocklist data to exclude
  outputDir: String = "",               // Output directory for CSV tables
  verbose: Boolean = false              // Enable verbose logging
)
```

#### Command Line Interface

Built using `scopt` library for argument parsing.

**Example Invocation:**
```bash
spark-submit \
  --driver-memory=2g \
  --executor-memory=2g \
  --master spark://host:7077 \
  --class tic.Transform \
  target/scala-2.11/TIC\ preprocessing-assembly-0.1.0.jar \
  --mapping_input_file mapping.json \
  --data_input_file data.json \
  --data_dictionary_input_file data_dict.json \
  --auxiliary_dir auxiliary/ \
  --filter_dir filter/ \
  --block_dir block/ \
  --output_dir output/ \
  --verbose
```

#### Data Processing Pipeline

**Main Workflow (Transform.scala:496-594):**

```
1. Load mapping.json (field definitions)
2. Load data_dict.json (REDCap metadata)
3. Read and filter source data
   ├── Load JSON with all-string schema
   ├── Convert types based on mapping
   ├── Filter to non-repeating instruments
   ├── Left join auxiliary data
   ├── Inner join filter data
   └── Exclude blocklist data
4. Generate ID columns
5. Copy columns to tables (one-to-one/many-to-one)
6. Collect/unpivot columns to tables (many-to-many)
7. Generate auxiliary tables
   ├── reviewer_organization
   └── name (dropdown metadata)
8. Write CSV tables to output directory
```

#### Data Filter Types

**DataFilter.filter1** - Keep Only Non-Repeating Records (Transform.scala:85-93)
```scala
// Keep only records where redcap_repeat_instrument is empty
// These are the main proposal records (not repeating instruments)
data.filter(
  data.col("redcap_repeat_instrument") === "" &&
  data.col("redcap_repeat_instance").isNull
)
```

**DataFilter.testDataFilter** - Filter Test Data (Transform.scala:54-83)
```scala
// Filter out records that are:
// - Missing title
// - Title without spaces (likely placeholder)
// - Both pi_firstname and pi_lastname are malformed
```

**DataFilter.auxDataFilter** - Join Auxiliary Data (Transform.scala:95-114)
```scala
// Left join additional CSV files from auxiliaryDir
// Joins on columns that exist in both dataframes
```

**DataFilter.blockDataFilter** - Exclude Blocklist (Transform.scala:116-153)
```scala
// Left join blocklist CSVs, then filter out matching records
// Uses null-safe equality (<=>)
```

#### Type Conversion

```scala
def convert(fieldType: String): DataType =
  fieldType match {
    case "boolean" => BooleanType
    case "int" => IntegerType
    case "date" => DateType
    case "text" => StringType
    case _ => throw new RuntimeException("unsupported type " + fieldType)
  }
```

**Note:** Types are more limited than map-pipeline-schema (no float/bigint)

#### ID Generation (Transform.scala:321-355)

For fields with `generate_ID(...)` expressions:
1. Parse the GenerateID AST
2. Evaluate each argument to create temporary columns
3. Select distinct combinations of these columns
4. Assign monotonically increasing IDs
5. Join IDs back to main dataset
6. Drop temporary columns

**Example:**
```
Fieldname_redcap: "generate_ID(pi_firstname, pi_lastname)"
Fieldname_CTMD: "userId"

Creates unique userId for each (pi_firstname, pi_lastname) combination
```

#### Copy Operation (Transform.scala:366-408)

Handles one-to-one and many-to-one field mappings (no `___` in field name).

**Algorithm:**
1. Find all fields in mapping where `Fieldname_redcap` references only "copy columns"
2. Group by `Table_CTMD`
3. For each table:
   - Evaluate DSL expressions for each column
   - Select distinct rows
   - Store in tableMap

**Example:**
```
Table: User
Columns:
  - firstName <- extract_first_name(pi_name)
  - lastName <- extract_last_name(pi_name)
  - email <- pi_email
```

#### Collect/Unpivot Operation (Transform.scala:411-494)

Handles many-to-many relationships (checkbox fields with `___` pattern).

**Checkbox Pattern:**
REDCap exports checkboxes as multiple columns:
```
service_requested___1    (1 if checked, 0 if not)
service_requested___2
service_requested___3
```

**Algorithm:**
1. Identify unpivot columns (contain `___`)
2. Group by base name (before `___`)
3. For each table with unpivot fields:
   - Extract primary key columns
   - Select distinct rows with checkbox columns
   - Convert "wide" format to "long" format:
     - Filter rows where checkbox value is "1" or 1
     - Create new row for each checked option
     - Each row contains: [primary keys, checkbox_option_name]
4. Join with existing table data

**Example:**
```
Input (wide):
proposal_id | service___consulting | service___biostat
123         | 1                    | 0
456         | 1                    | 1

Output (long):
proposal_id | service
123         | consulting
456         | consulting
456         | biostat
```

**Assertion:** Each table can have at most ONE many-to-many field (Transform.scala:450)

#### Auxiliary Table Generation

**reviewer_organization Table (Transform.scala:538-549)**

Extracts reviewer names from columns with pattern `reviewer_name_<organization>`:

```scala
// Find all columns starting with "reviewer_name_"
// For each column:
//   - Extract reviewer values (non-empty, distinct)
//   - Extract organization from column suffix
//   - Create (reviewer, organization) pairs
```

**name Table (Transform.scala:550-587)**

Lookup table for dropdown/checkbox option descriptions:

```scala
Schema:
- table: String         // Table name
- column: String        // Column name
- index: String         // Option code/index
- id: String            // Concatenated field_name___index
- description: String   // Human-readable description
```

**Sources:**
1. Dropdown/checkbox metadata from data dictionary
2. CTSA organization names from fields matching `^ctsa_[0-9]*$`

**Location:** Transform.scala:1-596

### 5. Utils.scala - File I/O Utilities

Hadoop filesystem utilities for reading/writing data in distributed environment.

**Key Functions:**

#### writeDataframe
```scala
def writeDataframe(
  hc: Configuration,
  output_file: String,
  table: DataFrame,
  header: Boolean = false
): Unit
```
Writes Spark DataFrame to single CSV file with optional header.

**Process:**
1. Write DataFrame to temporary directory (multiple part files)
2. Merge all parts into single file using `copyMerge`
3. Delete temporary directory
4. Prepend header if requested

#### copyMerge
```scala
def copyMerge(
  hc: Configuration,
  output_dir_fs: FileSystem,
  overwrite: Boolean,
  output_filename: String,
  coldir: Path
): Boolean
```
Merges multiple Spark output part files into single file.

#### prependStringToFile
```scala
def prependStringToFile(
  hc: Configuration,
  text: String,
  path: String
): Unit
```
Adds text to beginning of file (used for CSV headers).

#### Cache Class
```scala
class Cache[K, V <: AnyRef](fun: K => V)
```
Soft-reference based cache to avoid recomputation of DataFrames while allowing garbage collection under memory pressure.

**Location:** Utils.scala:1-203

### 6. Python Wrapper Scripts

#### run.py

Simple wrapper to invoke Spark job:

```python
from utils import submit
import sys

host = sys.argv[1]        # Spark master host
cache_dir = sys.argv[2]   # Cache directory
args = sys.argv[3:]       # Pass-through arguments

submit(host, cache_dir, "tic.Transform", *args)
```

#### utils.py

Spark-submit command builder:

```python
def submit(host_name, cache_dir, cls, *args, **kwargs):
    cmd = [
        "spark-submit",
        "--executor-memory=3g",
        "--master", host_name,
        "--class", cls,
        "target/scala-2.11/TIC preprocessing-assembly-1.0.jar"
    ] + list(args)

    proc = subprocess.Popen(cmd)
    err = proc.wait()
```

**Location:** src/main/python/

## Data Types and Structures

### Input Data Types

#### mapping.json
Array of field mapping objects (see map-pipeline-schema-report.md for full schema).

**Key Fields Used:**
- `Fieldname_CTMD` - Target database field name
- `Fieldname_redcap` - Source field DSL expression
- `Data Type` - Field data type (boolean, int, date, text)
- `Table_CTMD` - Target table name
- `Primary` - "yes" if primary key field
- `InitializeField` - "yes" to include in processing

#### data.json (REDCap Export)

JSON array of clinical trial proposal records.

**Standard REDCap Fields:**
- `proposal_id` - Unique proposal identifier
- `redcap_repeat_instrument` - Name of repeating instrument (empty for main record)
- `redcap_repeat_instance` - Instance number for repeating instrument
- `<field_name>` - Data fields from all instruments
- `<field_name>___<option>` - Checkbox fields (0 or 1 for each option)

#### data_dict.json (REDCap Metadata)

JSON array of field definitions.

**Schema:**
- `field_name` - Field name
- `form_name` - Instrument/form name
- `field_type` - Field type (text, dropdown, checkbox, etc.)
- `field_label` - Human-readable label
- `select_choices_or_calculations` - Dropdown/checkbox options
- Other metadata fields

### Output Data Types

#### CSV Tables

One CSV file per table in mapping, written to `{outputDir}/tables/{tableName}`.

**Format:**
- Header row with column names
- CSV-escaped values
- Quote character: `"`
- Escape character: `"`
- Separator: `,`

#### Diagnostic Outputs

- `{outputDir}/unknown` - Columns in data but not in mapping
- `{outputDir}/missing` - Columns in mapping but not in data

### Spark SQL Types

```scala
BooleanType   // boolean
IntegerType   // int
DateType      // date
StringType    // text
```

## Data Processing Features

### Column Pattern Matching

**Copy Columns:** Field names without `___`
- One-to-one or many-to-one relationships
- Processed using direct column evaluation

**Unpivot Columns:** Field names with `___` (e.g., `service___1`)
- Many-to-many relationships (checkboxes)
- Converted from wide format to long format
- Only values equal to "1" or 1 are included

### Join Strategies

**Auxiliary Data:** Left join
- Data from `auxiliaryDir/*.csv`
- Joins on columns present in both DataFrames
- Preserves all source records

**Filter Data:** Inner join
- Data from `filterDir/*.csv`
- Joins on columns present in both DataFrames
- Only keeps matching records

**Blocklist Data:** Left join + filter
- Data from `blocklistDir/*.csv`
- Null-safe equality join
- Removes matching records

### Data Quality Filters

**Test Data Detection:**
- Empty titles
- Titles without spaces
- Malformed PI names

**Name Validation:**
- First name must match pattern (capitalized, alphabetic)
- Last name must match pattern (capitalized, alphabetic)
- Various name formats supported with fallbacks

### Table Formatting

**Tabulator Object (Transform.scala:158-204)**

Console-friendly table formatter for logging:
- Wraps text to 26 characters
- Pads columns for alignment
- Adds borders and separators
- Used extensively for debug output

## Integration Points

### Input Sources

1. **mapping.json** - Field mapping configuration
2. **REDCap API** - Clinical trial data via GetData/GetDataDict
3. **Auxiliary CSVs** - Additional data to join
4. **Filter CSVs** - Records to include (whitelist)
5. **Blocklist CSVs** - Records to exclude (blacklist)

### Output Destinations

1. **CSV Tables** - `{outputDir}/tables/{tableName}`
   - One file per table
   - Ready for database import via `csvsql`

2. **Diagnostic Files**
   - `{outputDir}/unknown` - Unmapped columns
   - `{outputDir}/missing` - Missing columns

### Related Services

- **map-pipeline-schema** - Generates SQL schema from mapping.json
- **Pipeline Server (server.py)** - Python Flask API wrapper
- **Database** - PostgreSQL (populated via `csvsql` command)
- **REDCap** - Vanderbilt REDCap instance (data source)

## Build and Deployment

### Building

```bash
cd services/pipeline/map-pipeline
sbt assembly
```

**Output:** `target/scala-2.11/TIC preprocessing-assembly-0.2.0.jar`

**JAR Assembly:** Fat JAR with all dependencies using sbt-assembly plugin

### Merge Strategy

Custom merge strategy for dependency conflicts (build.sbt:12-26):
- Takes last version for javax.inject, javax.activation
- Takes last version for Netty, Apache Commons
- Discards git.properties

### Running Standalone

```bash
spark-submit \
  --driver-memory=2g \
  --executor-memory=2g \
  --master spark://host:7077 \
  --class tic.Transform \
  target/scala-2.11/TIC\ preprocessing-assembly-0.2.0.jar \
  --mapping_input_file ../mapping.json \
  --data_input_file ../data/records.json \
  --data_dictionary_input_file ../data/dictionary.json \
  --auxiliary_dir ../auxiliary \
  --filter_dir ../filter \
  --block_dir ../block \
  --output_dir ../output \
  --verbose
```

### Running in Docker

**Docker Image:** `txscience/ctmd-pipeline-reload:<version>`

**Build Process:**
1. Create Dockerfile in tic-map-pipeline-script repo
2. Build: `docker build . -t txscience/ctmd-pipeline-reload:<version>`
3. Push: `docker push txscience/ctmd-pipeline-reload:<version>`
4. Update docker-compose.yml references

**Environment Variables** (from .env file):
- Redcap API tokens
- Database credentials
- Spark master URL
- Input/output directories

### Database Population

After pipeline execution, load CSVs into PostgreSQL:

```bash
cd output/tables
csvsql \
  --db "postgresql://<uid>:<pwd>@<host>/<db>" \
  --insert \
  --no-create \
  -p \\ \
  -e utf8 \
  --date-format "%y-%M-%d" \
  tables/*
```

**Prerequisites:**
- Database schema already created (via map-pipeline-schema)
- Tables exist but are empty
- csvkit and psycopg2-binary installed

## Key Features

### Extensible DSL

Custom transformation language supports:
- Field references
- Coalescing (fallback values)
- Name parsing
- ID generation
- Conditional logic
- Equality comparisons

### Scalable Processing

Apache Spark provides:
- Distributed data processing
- Lazy evaluation and optimization
- Automatic partitioning
- Fault tolerance
- Memory caching for iterative operations

### Data Persistence Strategy

Strategic use of `.persist(StorageLevel.MEMORY_AND_DISK)`:
- After filtering operations (Transform.scala:81, 91, 112, 151)
- After expensive joins
- Before multiple accesses
- Prevents recomputation of transformation pipeline

### Comprehensive Logging

Detailed logging at each stage:
- Row counts after each operation
- Join conditions and columns
- Table samples for verification
- Formatted tables for readability

### Flexible Configuration

Command-line driven configuration:
- All inputs/outputs configurable
- Optional auxiliary/filter/block directories
- Verbose mode for debugging

## Limitations and Constraints

### Data Constraints

1. **Single Unpivot Field Per Table**
   - Assertion enforced at Transform.scala:450
   - Each table can have only one many-to-many relationship
   - Multiple checkboxes must go to separate tables

2. **Type System Limitations**
   - Only 4 types: boolean, int, date, text
   - No float/double support (unlike map-pipeline-schema)
   - No bigint (uses int instead)

3. **Checkbox Format**
   - Must use `___` separator
   - Values must be "1" or 1 for checked
   - Other values treated as unchecked

### Performance Considerations

1. **Memory Usage**
   - Driver memory: 2-3GB recommended
   - Executor memory: 2-3GB per executor
   - Multiple DataFrames cached in memory
   - Soft-reference cache allows GC under pressure

2. **Spark Overhead**
   - Setup time for Spark context
   - Job scheduling overhead
   - May be overkill for small datasets

### API Dependencies

1. **Hardcoded REDCap URL**
   - `redcap.vanderbilt.edu` hardcoded in GetData/GetDataDict
   - Not configurable via command line
   - Would need code change for different REDCap instance

2. **REDCap API Format**
   - Assumes flat JSON export format
   - Assumes checkbox naming convention
   - Tightly coupled to REDCap data structure

### Data Quality

1. **Name Parsing Fragility**
   - Complex parser with many edge cases
   - Fallback logic may produce incorrect results
   - Non-English names may fail parsing

2. **Test Data Filtering**
   - Heuristic-based (title format, name validation)
   - May incorrectly filter legitimate data
   - May incorrectly include test data

### File Format

1. **CSV Limitations**
   - No data type information preserved
   - Requires separate schema definition
   - Special characters require escaping
   - Date format must match database expectations

## Potential Issues

### Type Mismatch

map-pipeline (Spark) vs. map-pipeline-schema (SQL):
- Spark: int → IntegerType (32-bit)
- SQL: int → bigint (64-bit)
- Potential overflow for large IDs

### Boolean Parsing Bug

Related to map-pipeline-schema bug (BoolWrapper):
- Schema generator has "FALSE" → True bug
- May cause type mismatches if fixed

### Date Format

- Spark outputs date format
- csvsql expects `%y-%M-%d` format
- May need format conversion

### Null Handling

- DSL coalesce uses `isNull || === lit("")`
- SQL NULL vs. empty string semantics
- Potential mismatches in null-safe comparisons

### Concurrency

- GetData/GetDataDict use Futures
- No obvious place they're awaited
- May have async issues in main execution

## Error Handling

### Parsing Errors

**DSL Parser:**
- Throws `scala.sys.error` on parse failure
- No recovery mechanism
- Will fail entire job

**Name Parser:**
- Logs parsing errors
- Returns `[null, input]` on failure
- Continues processing

**Metadata Parser:**
- Logs parsing errors
- Returns `None` on failure
- Skips unparseable options

### Data Errors

**Type Conversion:**
- Throws RuntimeException on unsupported type
- No validation of type compatibility
- No handling of conversion errors

**Schema Errors:**
- Spark mode set to "FAILFAST"
- Any schema mismatch fails job
- No partial recovery

### File Errors

- No error handling for missing directories
- No validation of file existence before processing
- Hadoop exceptions propagate to user

## Testing

### Test Data

Test data available at: `services/pipeline/test/`
- `test/mapping.json` - Sample mapping
- `test/add/` - Sample data CSVs
- `test/auxiliary*/` - Auxiliary data samples
- `test/block*/` - Blocklist samples
- `test/filter*/` - Filter data samples
- `test/tables/` - Expected table outputs

### Test Filters

DataFilter includes testDataFilter specifically for identifying test data:
- Validates proposal title format
- Validates PI name format
- Logs filtered proposals
- Separates test data from production data

## Future Considerations

### Improvements

1. **Type System Enhancement**
   - Add float/double support
   - Use consistent types with map-pipeline-schema
   - Add decimal type for currency

2. **Configuration**
   - Make REDCap URL configurable
   - Support multiple REDCap instances
   - Externalize hardcoded values

3. **Error Handling**
   - Graceful degradation on parsing errors
   - Better error messages
   - Partial failure recovery

4. **Performance**
   - Lazy loading of auxiliary data
   - Streaming for very large datasets
   - Better memory management

5. **Testing**
   - Unit tests for DSL parser
   - Integration tests for full pipeline
   - Property-based testing for name parser

6. **Documentation**
   - Inline scaladoc comments
   - DSL language reference
   - Troubleshooting guide

### Enhancements

1. **Multi-Unpivot Support**
   - Remove single unpivot per table constraint
   - Support multiple many-to-many relationships

2. **Data Validation**
   - Pre-flight validation of mapping vs. data
   - Type compatibility checks
   - Referential integrity validation

3. **Monitoring**
   - Metrics export (row counts, timing)
   - Data quality metrics
   - Spark UI integration

4. **Incremental Processing**
   - Support for delta updates
   - Change data capture
   - Timestamp-based filtering

## Summary

The map-pipeline service is a sophisticated Apache Spark-based ETL pipeline that transforms clinical trial data from REDCap into a structured database format. Built in Scala, it provides:

**Strengths:**
- Custom DSL for flexible field transformations
- Sophisticated name parsing for PI extraction
- Scalable Spark-based processing
- Support for complex many-to-many relationships via unpivoting
- Comprehensive filtering and data quality checks
- Extensive logging and debugging support

**Architecture:**
- Functional Scala code using Spark SQL
- Combinator parsers for DSL and name parsing
- Configurable via command line
- Integration with REDCap API
- Docker containerization for deployment

**Data Flow:**
1. Fetch data from REDCap API (optional)
2. Load mapping configuration and data dictionary
3. Apply filters and joins
4. Generate synthetic IDs
5. Copy one-to-one/many-to-one relationships
6. Unpivot checkbox fields for many-to-many
7. Generate auxiliary lookup tables
8. Output CSV files for database import

The service is production-ready but has opportunities for improvement in error handling, type consistency, and configuration flexibility.

## Version History

**Version 0.2.0** (Current)
- Build configuration in build.sbt
- Transform program version 0.2.2
- Scala 2.11.8
- Spark 2.3.2

## References

### Related Documentation
- map-pipeline-schema-report.md - SQL schema generation service
- [REDCap API Documentation](https://redcap.vanderbilt.edu/api/)
- [Apache Spark SQL Documentation](https://spark.apache.org/docs/2.3.2/sql-programming-guide.html)

### Code References
- Transform.scala:496 - Main entry point
- DSL.scala:227 - DSL parser apply method
- DSL.scala:232 - DSL evaluator
- Transform.scala:366 - Copy operation
- Transform.scala:411 - Collect/unpivot operation
- Transform.scala:321 - ID generation
