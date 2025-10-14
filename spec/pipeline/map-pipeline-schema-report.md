# Map Pipeline Schema Service Report

## Overview

The `map-pipeline-schema` is a Haskell-based service that dynamically generates PostgreSQL database schemas from a JSON mapping configuration file. It converts mapping definitions into SQL CREATE TABLE statements.

**Location:** `services/pipeline/map-pipeline-schema/`

**Primary Purpose:** Transform mapping.json configuration into database table definitions (tables.sql)

## Architecture

### Technology Stack

- **Language:** Haskell
- **Build System:** Stack (Haskell Tool Stack)
- **Stack Resolver:** lts-13.7
- **Package Manager:** package.yaml (Hpack format)

### Dependencies

- `base >= 4.7 && < 5` - Core Haskell libraries
- `bytestring` - Binary string processing
- `vector` - Efficient arrays
- `text` - Unicode text handling
- `containers` - Standard container types
- `aeson` - JSON parsing and encoding

### Service Components

```
map-pipeline-schema/
├── app/
│   └── Main.hs              # Entry point executable
├── src/
│   └── PMD/
│       ├── HEALMapping.hs   # Data type definitions and JSON parsing
│       └── SQLGen.hs        # SQL generation logic
├── test/
│   └── Spec.hs             # Test specifications
├── package.yaml            # Package configuration
├── stack.yaml              # Stack build configuration
└── README.md               # Documentation
```

## Data Types

### Core Data Types (PMD.HEALMapping.hs)

#### 1. Item

The primary data structure representing a field mapping from the mapping.json input.

```haskell
data Item = Item {
    fieldNameHEAL :: !Text,              -- CTMD field name
    fieldNamePhase1 :: !Text,            -- RedCap field name
    dataType :: !SQLType,                -- SQL data type
    randomizationFeature :: !RandomizationFeature,
    dropdownOptions :: !Text,            -- Options for dropdown fields
    lookupNeeded :: !Bool,               -- Whether lookup is required
    lookupInformation :: !Text,          -- Lookup details
    algorithm :: !Text,                  -- Transformation algorithm
    key :: !Text,                        -- Key description
    isPrimaryKey :: !Bool,               -- Primary key flag
    isForeignKey :: !Bool,               -- Foreign key flag
    foreignKeyTable :: !Text,            -- Referenced table name
    cardinality :: !Text,                -- Relationship cardinality
    tableHeal :: !Text,                  -- CTMD table name
    tablePhase1 :: !Text,                -- Phase 1 table name
    nonNull :: !Bool,                    -- NOT NULL constraint
    defaultValue :: !Text,               -- Default value
    fieldStatus :: !Text,                -- Field status
    instrument :: !Text,                 -- Source instrument
    description :: !Text,                -- Field description
    comments :: !Text                    -- Additional comments
}
```

**JSON Mapping (from mapping.json):**
- `Fieldname_CTMD` → fieldNameHEAL
- `Fieldname_redcap` → fieldNamePhase1
- `Data Type` → dataType
- `Randomization_feature` → randomizationFeature
- `Dropdown Options` → dropdownOptions
- `Lookup Needed` → lookupNeeded
- `Lookup Information` → lookupInformation
- `Algorithm` → algorithm
- `Key` → key
- `Primary` → isPrimaryKey
- `Foreign` → isForeignKey
- `FK_tablename` → foreignKeyTable
- `Cardinality (Table_CTMD--FK_tablename)` → cardinality
- `Table_CTMD` → tableHeal
- `Table_phase1` → tablePhase1
- `NOT NULL` → nonNull
- `Default Value` → defaultValue
- `Field Status` → fieldStatus
- `Instrument` → instrument
- `Description` → description
- `Comments` → comments

#### 2. SQLType

SQL data type enumeration with mapping to PostgreSQL types.

```haskell
data SQLType =
    SQLVarchar          -- Maps to "varchar"
  | SQLBoolean          -- Maps to "boolean"
  | SQLInteger          -- Maps to "bigint"
  | SQLDate             -- Maps to "date"
  | SQLFloat            -- Maps to "double precision"
```

**Type Conversion Rules:**
- `"int"` → SQLInteger → "bigint"
- `"float"` → SQLFloat → "double precision"
- `"boolean"` → SQLBoolean → "boolean"
- `"date"` → SQLDate → "date"
- `"text*"` (any text variant) → SQLVarchar → "varchar"

#### 3. RandomizationFeature

Enumeration for data randomization/generation features.

```haskell
data RandomizationFeature =
    FirstName           -- Generate first name
  | LastName            -- Generate last name
  | Name                -- Generate full name
  | Id                  -- Generate ID
  | Email               -- Generate email
  | PhoneNumber         -- Generate phone number
  | LongTitle           -- Generate long title
  | ShortTitle          -- Generate short title
  | Index               -- Generate index
  | Int Int Int         -- Integer range (min, max)
  | Float               -- Generate float
  | MONTHDASHYY         -- Generate month-year format
  | None                -- No randomization
```

**JSON String Mappings:**
- `"firstname"` → FirstName
- `"lastname"` → LastName
- `"name"` → Name
- `"id"` → Id
- `"email"` → Email
- `"phonenumber"` → PhoneNumber
- `"shorttitle"` → ShortTitle
- `"longtitle"` → LongTitle
- `"index"` → Index
- `"nat"` → Int 0 maxBound (natural numbers)
- `"month-yy"` → MONTHDASHYY
- `""` (empty) → None

#### 4. BoolWrapper

Helper type for parsing boolean values from various string representations.

```haskell
newtype BoolWrapper = BoolWrapper { getBool :: Bool }
```

**Conversion Rules:**
- `"yes"` → True
- `"TRUE"` → True
- `"FALSE"` → True (Note: This appears to be a bug in the code at line 53 of HEALMapping.hs)
- `""` (empty string) → False
- Any other value → Parse error

#### 5. SQLStatement

Data structure for SQL CREATE TABLE statement generation.

```haskell
data SQLStatement = SQLCreate {
    tableName :: String,
    columns :: [(String, SQLType)]
}
```

### Type Classes

#### ToSQL

Interface for converting data types to SQL strings.

```haskell
class ToSQL a where
    toSQL :: a -> String
```

**Implementations:**
- `SQLType` → PostgreSQL type strings
- `SQLStatement` → Complete CREATE TABLE statements

## Service Workflow

### Input Processing

1. **Input:** `mapping.json` - Array of Item objects defining field mappings
2. **Parsing:** Uses Aeson library to decode JSON into `[Item]` (list of Items)
3. **Validation:** Type checking and conversion during JSON parsing

### Transformation Pipeline

1. **Grouping:** Items are grouped by `tableHeal` field (CTMD table name)
   - Uses `groupBy` and `sortOn` functions
   - Creates separate groups for each table

2. **SQL Generation:** For each table group:
   - Extract table name from `tableHeal` of first item
   - Map each Item to `(fieldName, dataType)` tuple
   - Create `SQLCreate` statement with table name and columns

3. **Additional Tables:** Two hardcoded tables are added:
   ```sql
   CREATE TABLE "reviewer_organization" (
       "reviewer" varchar,
       "organization" varchar
   )

   CREATE TABLE "name" (
       "table" varchar,
       "column" varchar,
       "index" varchar,
       "id" varchar,
       "description" varchar
   )
   ```

4. **Output Generation:** Each SQLStatement is converted to SQL string with semicolon

### Output Format

**Output:** `tables.sql` - Collection of CREATE TABLE statements

Example output format:
```sql
create table "StudyPI" ("AreYouStudyPI" boolean, "userId" bigint);
create table "User" ("firstName" varchar, "lastName" varchar, "email" varchar);
create table "reviewer_organization" ("reviewer" varchar, "organization" varchar);
create table "name" ("table" varchar, "column" varchar, "index" varchar, "id" varchar, "description" varchar);
```

## Usage

### Building the Service

```bash
cd services/pipeline/map-pipeline-schema
stack build
```

### Running the Service

```bash
stack exec map-pipeline-schema-exe <inputFile> <outputFile>
```

**Example:**
```bash
stack exec map-pipeline-schema-exe ../mapping.json ../data/tables.sql
```

**Container Usage:**
```bash
# Inside ctmd-pipeline container
stack exec map-pipeline-schema-exe ../mapping.json ../data/tables.sql
```

## Integration Points

### Input Source
- **File:** `mapping.json` (typically at repository root or data directory)
- **Format:** JSON array of field mapping objects
- **Location References:**
  - `/data/mapping.json`
  - `/helm-charts/ctmd-dashboard/files/mapping.json`
  - `/services/pipeline/test/mapping.json`

### Output Destination
- **File:** `tables.sql`
- **Purpose:** Database schema initialization
- **Usage:** Executed against PostgreSQL database to create table structure

### Related Services
- **map-pipeline:** Scala/Spark-based data transformation pipeline
- **Pipeline Server:** Python Flask application (server.py)
- **Database:** PostgreSQL database for CTMD data

## Key Features

### Dynamic Schema Generation
- Schema is entirely driven by mapping.json configuration
- No hardcoded table definitions (except two auxiliary tables)
- Flexible column additions/removals via JSON changes

### Type Safety
- Strong typing through Haskell type system
- Compile-time type checking
- JSON parsing with validation

### Extensibility
- To add new data types: Update SQLType and FromJSON instance
- To add new randomization features: Update RandomizationFeature enum
- To change field mappings: Update Item FromJSON instance

## Potential Issues

### Known Bug
In `PMD.HEALMapping.hs:53`, the BoolWrapper parser converts "FALSE" to True:
```haskell
"FALSE" -> pure (BoolWrapper True)  -- Should be False
```

### Limitations
1. No support for:
   - Primary key constraints in generated SQL
   - Foreign key constraints in generated SQL
   - NOT NULL constraints (parsed but not used)
   - Default values (parsed but not used)
   - Indexes
   - Table relationships/references

2. Generated SQL is minimal - only table and column definitions with types

3. No validation of:
   - Foreign key references
   - Cardinality constraints
   - Circular dependencies

## Configuration Files

### package.yaml
- Package metadata and dependencies
- Build configuration
- Executable and test suite definitions

### stack.yaml
- Stack resolver: lts-13.7 (Haskell LTS snapshot)
- Build settings and package locations

## Testing

Test file located at: `services/pipeline/map-pipeline-schema/test/Spec.hs`

Test data available at: `services/pipeline/test/mapping.json`

## Future Considerations

1. **Constraint Generation:** Add support for PRIMARY KEY, FOREIGN KEY, and NOT NULL constraints
2. **Default Values:** Implement default value generation in SQL
3. **Index Creation:** Add index definitions for performance
4. **Validation:** Pre-validate foreign key references and cardinality
5. **Bug Fix:** Correct "FALSE" boolean parsing
6. **Documentation:** Add inline code documentation (Haddock)
7. **Error Handling:** Improve error messages for malformed input

## Summary

The map-pipeline-schema service is a focused, type-safe tool for converting JSON mapping configurations into PostgreSQL table schemas. Built in Haskell, it leverages strong typing and functional programming principles to ensure reliable schema generation. While the generated SQL is currently minimal, the architecture is extensible and can be enhanced to support full constraint and relationship definitions.
