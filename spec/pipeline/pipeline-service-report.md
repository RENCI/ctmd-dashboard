# Pipeline Service Report

## Overview

The Pipeline Service is a Python-based orchestration layer that manages the complete ETL (Extract, Transform, Load) workflow for the CTMD (Clinical Trial Management Dashboard) system. It coordinates data extraction from REDCap, transformation via Spark (map-pipeline), schema generation (map-pipeline-schema), and database loading into PostgreSQL.

**Location:** `services/pipeline/`

**Primary Purpose:** REST API and scheduler for managing the complete data pipeline lifecycle including backup, restore, sync, and incremental table updates

## Architecture

### Technology Stack

- **Language:** Python 3
- **Web Framework:** Flask with Flask-CORS
- **Task Queue:** Redis Queue (RQ)
- **Distributed Locking:** Sherlock (Redis-based)
- **Database:** PostgreSQL (via psycopg2)
- **Data Loading:** csvkit (csvsql command)
- **Scheduler:** schedule library
- **Data Processing:** Apache Spark (via subprocess)
- **Container:** Docker (Ubuntu 20.04 base)

### Core Components

```
services/pipeline/
├── application.py           # Main entry point and orchestrator
├── server.py                # Flask REST API server
├── reload.py                # Core ETL and database operations
├── utils.py                 # REDCap API client and logging
├── fields.py                # Test data generator
├── filter_metadata.py       # Metadata filtering utility
├── Dockerfile               # Multi-stage Docker build
├── reload4j-1.2.26.jar     # Log4j replacement for security
└── test/
    ├── test_reload.py       # Core functionality tests
    ├── test_table.py        # Table operation tests
    └── test_utils.py        # Test utilities
```

## Module Details

### 1. application.py - Main Orchestrator

Entry point that coordinates all services and processes.

**Responsibilities:**
- Read environment configuration
- Start RQ worker process
- Start pipeline reload process
- Optionally start REST API server
- Coordinate multiprocessing

**Process Architecture:**
```python
Process 1: RQ Worker (reload.startWorker)
  - Consumes tasks from Redis queue
  - Executes long-running operations

Process 2: Pipeline Entrypoint (reload.entrypoint)
  - Creates tables (if CREATE_TABLES=1)
  - Inserts data (if INSERT_DATA=1)
  - Runs one-off sync (if RELOAD_ONE_OFF=1)
  - Schedules periodic reloads (if RELOAD_SCHEDULE=1)

Process 3 (Optional): REST API Server (server.server)
  - Runs if SERVER=1
  - Provides HTTP endpoints for operations
```

**Configuration Flags:**
```python
RELOAD_SCHEDULE      # "1" to enable daily scheduled reloads
RELOAD_ONE_OFF       # "1" to run sync on startup
CREATE_TABLES        # "1" to create database schema on startup
INSERT_DATA          # "1" to insert data on startup
SCHEDULE_RUN_TIME    # Time for daily reload (format: "HH:MM")
SERVER               # "1" to start REST API server
```

**Location:** application.py:1-34

### 2. server.py - REST API Server

Flask-based REST API for pipeline operations.

#### API Endpoints

**Backup Management:**

```
GET /backup
  Returns: List of backup timestamps (sorted by modification time, newest first)
  Example: ["2024-01-15 10:30:00.123", "2024-01-14 09:20:00.456"]

POST /backup
  Creates new database backup
  Returns: Task ID for async job
  Example: "abc123-def456-ghi789"

DELETE /backup/<timestamp>
  Deletes specified backup
  Returns: Task ID for async job
```

**Restore Operations:**

```
POST /restore/<timestamp>
  Restores database from backup
  - Clears current database
  - Restores from pg_dump file
  Returns: Task ID for async job
```

**Data Synchronization:**

```
POST /sync
  Full pipeline sync from REDCap
  - Downloads REDCap data and metadata
  - Runs Spark transformation
  - Creates backup
  - Syncs database
  Returns: Task ID for async job
```

**Table Operations:**

```
GET /table/<tablename>
  Returns: JSON array of table rows
  Example: [{"col1": "val1", "col2": "val2"}, ...]

PUT /table/<tablename>
  Overwrites entire table
  Body:
    - data: CSV or JSON file
    - json: Additional columns as JSON string
    - content-type: "text/csv" or "application/json"
    - has_comments: "true" if CSV has comment line
  Returns: Task ID for async job

POST /table/<tablename>
  Appends to table
  Body: Same as PUT
  Returns: Task ID for async job

POST /table/<tablename>/column/<columnname>
  Incremental update based on column value
  - Deletes rows matching column value
  - Inserts new rows
  - Handles siteId/ProposalID pairs specially
  Body: Same as PUT
  Returns: Task ID for async job
```

**Task Management:**

```
GET /task
  Returns: Status of all tasks
  Response: {
    "queued": ["task_id1", "task_id2"],
    "started": {
      "job_ids": ["task_id3"],
      "expired_job_ids": []
    },
    "finished": {...},
    "failed": {...},
    "deferred": {...}
  }

GET /task/<taskid>
  Returns: Detailed task information
  Response: {
    "status": "queued|started|finished|failed",
    "name": "function_name",
    "created_at": "2024-01-15 10:30:00",
    "enqueued_at": "2024-01-15 10:30:01",
    "started_at": "2024-01-15 10:30:02",
    "ended_at": "2024-01-15 10:35:00",
    "description": "task description",
    "result": "result or error message"
  }

DELETE /task/<taskid>
  Cancels pending task
  Returns: Task ID
```

#### File Upload Handling

**uploadFile Function (server.py:94-131)**

Converts uploaded files to standardized CSV format:

1. **JSON Input:**
   - Parses JSON array
   - Extracts keys from first object
   - Writes CSV with header row
   - Encoding: UTF-8

2. **CSV Input:**
   - Reads with latin-1 encoding
   - Optionally skips comment line
   - Re-writes with latin-1 encoding
   - Preserves all rows

3. **Additional Columns:**
   - Accepts `json` form parameter
   - Parses as key-value pairs
   - Appends to each row

**Temporary File Management:**
- Creates NamedTemporaryFile
- Passes filename to worker
- Worker deletes file after processing

#### Task Queue Integration

**Pattern:**
```python
# Server enqueues task
task = q.enqueue(worker_function, args=[...], job_timeout=TASK_TIME)
return json.dumps(task.id)

# Client polls for completion
GET /task/<task_id>  # Check status
```

**Task Timeout:**
Configured via `TASK_TIME` environment variable (in seconds)

**Location:** server.py:1-211

### 3. reload.py - Core ETL Operations

The workhorse module containing all data pipeline operations.

#### Context Management

**context() Function (reload.py:748-780)**

Builds configuration dictionary from environment variables:

```python
{
    "home": "~",
    "redcapApplicationToken": str,        # REDCap API token
    "dbuser": str,                        # PostgreSQL username
    "dbpass": str,                        # PostgreSQL password
    "dbhost": str,                        # PostgreSQL host
    "dbport": str,                        # PostgreSQL port
    "dbname": str,                        # PostgreSQL database name
    "reloaddb": bool,                     # Whether to reload from REDCap
    "backupDir": str,                     # Backup file directory
    "redcapURLBase": str,                 # REDCap API base URL
    "assemblyPath": str,                  # Spark JAR path
    "mappingInputFilePath": str,          # mapping.json path
    "downloadRedcapData": bool,           # Whether to download data
    "downloadRedcapDataDictionary": bool, # Whether to download metadata
    "dataInputFilePath": str,             # REDCap data JSON path
    "dataDictionaryInputFilePath": str,   # REDCap metadata JSON path
    "auxiliaryDir": str,                  # Auxiliary data directory
    "filterDir": str,                     # Filter data directory
    "blockDir": str,                      # Blocklist directory
    "outputDirPath": str,                 # Output directory
    "redisQueueHost": str,                # Redis queue host
    "redisQueuePort": int,                # Redis queue port
    "redisQueueDatabase": int,            # Redis queue DB number
    "redisLockHost": str,                 # Redis lock host
    "redisLockPort": int,                 # Redis lock port
    "redisLockDatabase": int,             # Redis lock DB number
    "redisLockExpire": int,               # Lock expiration (seconds)
    "redisLockTimeout": int,              # Lock timeout (seconds)
    "sparkDriverMemory": str,             # Spark driver memory (e.g., "2g")
    "sparkExecutorMemory": str            # Spark executor memory (e.g., "2g")
}
```

#### Distributed Locking

**Sherlock Configuration (reload.py:36-48)**

Redis-based distributed locks prevent concurrent database operations:

```python
sherlock.configure(
    backend=sherlock.backends.REDIS,
    client=redis.StrictRedis(...),
    expire=int(os.environ["REDIS_LOCK_EXPIRE"]),    # Lock auto-expires
    timeout=int(os.environ["REDIS_LOCK_TIMEOUT"])   # Wait timeout
)

G_LOCK = "g_lock"  # Global lock name
```

**Locking Pattern:**
```python
# Public function (locked)
def operationName(ctx, ...):
    with Lock(G_LOCK):
        return _operationName(ctx, ...)

# Private function (unlocked)
def _operationName(ctx, ...):
    # Actual implementation
    pass
```

**Locked Operations:**
- Database backup/restore
- Table creation
- Data insertion
- Database synchronization
- Pipeline execution

#### Database Operations

**Backup (reload.py:97-126)**

```python
def _backUpDatabase(ctx, ts):
    # Creates .pgpass for passwordless authentication
    pgpass(ctx)

    # Runs pg_dump
    subprocess.run([
        "pg_dump",
        "-O",                    # No ownership
        "-d", ctx["dbname"],
        "-U", ctx["dbuser"],
        "-h", ctx["dbhost"],
        "-p", ctx["dbport"],
        "-f", ctx["backupDir"] + "/" + ts
    ])
```

**Restore (reload.py:177-208)**

```python
def _restoreDatabase(ctx, ts):
    # Clear database
    clearDatabase(ctx)

    # Restore from backup
    subprocess.run([
        "psql",
        "-d", ctx["dbname"],
        "-U", ctx["dbuser"],
        "-h", ctx["dbhost"],
        "-p", ctx["dbport"],
        "-f", ctx["backupDir"] + "/" + ts
    ])
```

**Clear Database (reload.py:143-174)**

```python
def clearDatabase(ctx):
    # Query all tables in public schema
    cursor.execute("""
        SELECT table_schema,table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
    """)

    # Drop each table with CASCADE
    for table_name in tables:
        cursor.execute('DROP TABLE "{}" CASCADE'.format(table_name))
```

**Create Tables (reload.py:256-288)**

```python
def _createTables(ctx):
    # Generate tables.sql via map-pipeline-schema
    subprocess.run([
        "stack", "exec", "map-pipeline-schema-exe",
        "/mapping.json",
        "/data/tables.sql"
    ], cwd="/map-pipeline-schema")

    # Execute each SQL statement
    with open("/data/tables.sql", encoding="latin-1") as f:
        for line in f:
            cursor.execute(line)
```

#### Data Loading Operations

**Insert Data (reload.py:320-327)**

```python
def _insertData(ctx):
    tables = getTables(ctx)  # List files in data/tables/
    for table in tables:
        _insertDataIntoTable(ctx, table, "data/tables/" + table, {})
```

**Insert Into Table (reload.py:358-385)**

```python
def _insertDataIntoTable(ctx, table, f, kvp):
    # Add additional columns (kvp) to CSV
    runFile(lambda fn: subprocess.run([
        "csvsql",
        "--db", "postgresql://...",
        "--insert",              # Insert data
        "--no-create",           # Don't create table
        "-d", ",",               # Comma delimiter
        "-e", "latin1",          # Encoding
        "--no-inference",        # Don't infer types
        "--tables", table,
        fn
    ]), f, kvp)
```

**Update Table (reload.py:388-408)**

```python
def _updateDataIntoTable(ctx, table, f, kvp):
    # Delete all rows
    cursor.execute('DELETE FROM "{}"'.format(table))

    # Insert new data
    _insertDataIntoTable(ctx, table, f, kvp)
```

**Incremental Column Update (reload.py:555-633)**

```python
def _updateDataIntoTableColumn(ctx, table, column, f, kvp):
    # Track which values have been deleted
    updated = set()

    # For each row in upload:
    for row in reader:
        val = row[column_index]

        # Special handling for siteId/ProposalID pairs
        if column in ['siteId', 'ProposalID'] and pair_column_exists:
            combined_val = f"{val}-{pair_val}"
            if combined_val not in updated:
                # Delete by both columns
                cursor.execute(
                    'DELETE FROM "{}" WHERE "{}" = {} AND "{}" = %s',
                    (table, column, val, pair_column, pair_val)
                )
                updated.add(combined_val)
        else:
            # Delete by single column
            if val not in updated:
                cursor.execute(
                    'DELETE FROM "{}" WHERE "{}" = %s',
                    (table, column, val)
                )
                updated.add(val)

    # Insert all rows from upload
    _insertDataIntoTable(ctx, table, f, kvp)
```

**Purpose:** Allows updating specific studies without affecting others

#### Data Validation

**validateTable Function (reload.py:449-552)**

Comprehensive validation before database write:

**1. Header Validation**
```python
# Check for duplicate headers in upload
seen = set()
for header in headers:
    if header in seen:
        return [f"Duplicate header(s) in upload {header}"]
    seen.add(header)

# Check for overlap between uploaded and additional columns
if uploaded_headers ∩ additional_headers:
    return [f"Duplicate header(s) in input"]

# Check for undefined headers (with fuzzy matching)
for undefined_header in (uploaded_headers - db_headers):
    close_matches = difflib.get_close_matches(undefined_header, db_headers)
    if close_matches:
        errors.append(f"Undefined header {undefined_header}. Did you mean {close_matches[0]}?")
    else:
        errors.append(f"Undefined header {undefined_header}")
```

**2. Cell Validation**
```python
for row in rows:
    for cell, header in zip(row, headers):
        data_type = header_types[header]
        is_nullable = header_nullable[header]

        # Null/empty check
        if cell is None or cell == "":
            if not is_nullable:
                errors.append(f"Cell {letter}{row_num} must have a value")

        # Type validation
        if cell is not None and cell != "":
            if "int" in data_type:
                try:
                    int(cell)
                except ValueError:
                    errors.append(f"Cell {letter}{row_num} must be a natural number")

            elif "double" in data_type:
                try:
                    float(cell)
                except ValueError:
                    errors.append(f"Cell {letter}{row_num} must be a decimal number")

            elif "date" in data_type:
                if not validateDateFormat(cell):  # MM-DD-YYYY or MM/DD/YYYY
                    errors.append(f"Cell {letter}{row_num} must be a date...")

            elif "bool" in data_type:
                if cell.lower() not in ['true', 'false', 'yes', 'no']:
                    errors.append(f"Cell {letter}{row_num} must be a true or false value")
```

**3. Business Logic Validation**
```python
# StudySites: All proposal IDs must match
if tablename.lower() == "studysites":
    if proposal_id != previous_proposal_id:
        return ["For Study Sites uploads, ensure all proposal ID's match"]

# StudySites/CTSAs: Warn on blank cells (specific columns)
if (tablename.lower() == "studysites" and row < 4) or tablename.lower() == "ctsas":
    if cell == "":
        errors.append(f"Cell {letter}{row_num} is blank")
```

**Returns:**
- `None` if validation passes
- `List[str]` of error messages if validation fails

#### REDCap Integration

**Download Data (reload.py:708-727)**

```python
def downloadData(ctx):
    # Uses RedcapExport class from utils.py
    r = utils.RedcapExport(token, url)
    proposal_ids = r.get_proposal_ids()
    proposals = r.get_proposals(r.chunk_proposals(proposal_ids))
    r.write_to_file(proposals, output)
```

**Chunked Download Strategy:**
1. Fetch all proposal IDs
2. Chunk IDs into batches (default: 10)
3. For each batch: `[proposal_id]>=min && [proposal_id]<=max`
4. Merge results
5. Write to file

**Download Data Dictionary (reload.py:730-741)**

```python
def downloadDataDictionary(ctx):
    data = {
        "token": ctx["redcapApplicationToken"],
        "content": "metadata",
        "format": "json",
        "returnFormat": "json"
    }
    download(ctx, headers, data, output)
```

**Backup Data Dictionary (reload.py:211-232)**

Tracks changes to data dictionary:
- Compares new download to previous backup
- If different: renames old backup with timestamp
- Copies new version to backup location

#### ETL Pipeline Execution

**etl Function (reload.py:669-705)**

Executes Spark transformation:

```python
def etl(ctx):
    # Clear previous output
    if os.path.isdir("data/tables"):
        for f in os.listdir("data/tables"):
            os.remove("data/tables/" + f)

    # Run Spark job
    subprocess.run([
        "spark-submit",
        "--driver-memory", ctx["sparkDriverMemory"],
        "--executor-memory", ctx["sparkExecutorMemory"],
        "--master", "local[*]",
        "--class", "tic.Transform",
        ctx["assemblyPath"],
        "--mapping_input_file", ctx["mappingInputFilePath"],
        "--data_input_file", ctx["dataInputFilePath"],
        "--data_dictionary_input_file", ctx["dataDictionaryInputFilePath"],
        "--auxiliary_dir", ctx["auxiliaryDir"],
        "--filter_dir", ctx["filterDir"],
        "--block_dir", ctx["blockDir"],
        "--output_dir", ctx["outputDirPath"]
    ])
```

**Output:** CSV files in `data/tables/` directory

**Sync Database (reload.py:654-666)**

```python
def _syncDatabase(ctx):
    # Delete all data from tables (keep schema)
    _deleteTables(ctx)

    # Load all CSVs from data/tables/
    _insertData(ctx)
```

**Run Pipeline (reload.py:789-814)**

Complete end-to-end pipeline:

```python
def _runPipeline(ctx):
    # 1. Download from REDCap (if enabled)
    if ctx["reloaddb"] and ctx["downloadRedcapData"]:
        downloadData(ctx)
    if ctx["reloaddb"] and ctx["downloadRedcapDataDictionary"]:
        downloadDataDictionary(ctx)

    # 2. Backup data dictionary
    backUpDataDictionary(ctx)

    # 3. Run Spark ETL
    etl(ctx)

    # 4. Backup database (before sync)
    ts = str(datetime.datetime.now())
    _backUpDatabase(ctx, ts)

    # 5. Sync database (replace data)
    _syncDatabase(ctx)
```

#### Scheduling and Entry Point

**entrypoint Function (reload.py:817-856)**

Main orchestration function:

```python
def entrypoint(ctx, create_tables=None, insert_data=None,
               reload=None, one_off=None, schedule_run_time=None):
    # Wait for dependencies
    waitForDatabaseToStart(ctx["dbhost"], ctx["dbport"])
    waitForRedisToStart(ctx["redisQueueHost"], ctx["redisQueuePort"])
    waitForRedisToStart(ctx["redisLockHost"], ctx["redisLockPort"])

    # Create tables if requested
    if create_tables:
        createTables(ctx)

    # Insert data if requested
    if insert_data:
        insertData(ctx)

    # One-off sync if requested
    if one_off:
        runPipeline(ctx)

    # Schedule periodic reloads if requested
    if reload:
        schedule.every().day.at(schedule_run_time).do(lambda: runPipeline(ctx))
        while True:
            schedule.run_pending()
            time.sleep(1000)  # Check every ~17 minutes
```

**Worker Function (reload.py:783-786)**

```python
def startWorker():
    conn = redisQueue()
    worker = Worker(Queue(connection=conn), connection=conn)
    worker.work()  # Blocks and processes tasks
```

**Location:** reload.py:1-856

### 4. utils.py - REDCap Client and Utilities

#### Logger Setup

```python
def getLogger(name):
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        "%(asctime)s;%(levelname)s;%(message)s",
        "%Y-%m-%d %H:%M:%S"
    )
    handler.setFormatter(formatter)
    return logger
```

#### RedcapExport Class

**Chunked Export Strategy (utils.py:17-88)**

Handles large REDCap exports by batching requests:

```python
class RedcapExport:
    def __init__(self, token: str, url: str):
        self.token = token
        self.url = url
        self.batch_size = os.environ.get("BATCH_SIZE") or 10

    def get_proposal_ids(self) -> list:
        # Fetch only proposal_id field for all records
        response = requests.post(url, data={
            "content": "record",
            "format": "json",
            "fields": "proposal_id",
            "token": token
        })
        return sorted(response.json(), key=lambda k: int(k["proposal_id"]))

    def chunk_proposals(self, proposals: list) -> list:
        # Split into batches of batch_size
        return [
            proposals[x:x + self.batch_size]
            for x in range(0, len(proposals), self.batch_size)
        ]

    def iterate_over_batch(self, gte_proposal_id: str, lte_proposal_id: str):
        # Fetch all data for proposal ID range
        return requests.post(url, data={
            "content": "record",
            "format": "json",
            "filterLogic": f"[proposal_id]>={gte_proposal_id} && [proposal_id]<={lte_proposal_id}",
            "token": token
        })

    def get_proposals(self, proposals: list) -> list:
        merged = []
        for chunk in proposals:
            res = self.iterate_over_batch(chunk[0]["proposal_id"], chunk[-1]["proposal_id"])
            merged.append(res.json())
        return [item for sublist in merged for item in sublist]  # Flatten
```

**Configuration:**
- `BATCH_SIZE` environment variable controls chunk size
- Default: 10 proposals per request

**Location:** utils.py:1-88

### 5. fields.py - Test Data Generator

Generates synthetic data for testing by replacing sensitive fields.

**Algorithm (fields.py:1-71):**

```python
# Parse mapping.json to extract fields and their types
for row in mapping_csv:
    expr = row[1]  # Fieldname_redcap (DSL expression)
    ty = row[2]    # Data Type
    r = row[3]     # Randomization_feature

    # Extract field names from DSL expressions
    # Handles: simple fields, functions with (), coalesce with /

# For each record in input JSON:
for record in input_json:
    for field, value in record.items():
        if field in ["redcap_repeat_instrument", "redcap_repeat_instance"]:
            row[field] = ""
        elif field.startswith("reviewer_name_"):
            row[field] = "Alice Bob"
        else:
            # Replace based on data type and randomization feature
            if data_type == "date":
                row[field] = "2001-01-01"
            elif data_type == "int":
                row[field] = "0"
            elif data_type == "boolean":
                row[field] = "0"
            else:  # text
                if randomization_feature == "email":
                    row[field] = "user@email.edu"
                elif randomization_feature == "phonenumber":
                    row[field] = "111-222-3334"
                elif randomization_feature == "index":
                    row[field] = "1"
                elif randomization_feature == "firstname":
                    row[field] = "Alice"
                elif randomization_feature == "lastname":
                    row[field] = "Bob"
                else:
                    row[field] = "ipsum lorem"
```

**Usage:**
```bash
python fields.py mapping.csv input.json output.json
```

**Purpose:** Anonymize test data for development/testing environments

**Location:** fields.py:1-71

### 6. filter_metadata.py - Metadata Filtering

Filters and transforms REDCap metadata for testing.

**Algorithm (filter_metadata.py:1-58):**

```python
# Extract fields from mapping.json (similar to fields.py)

# For each metadata record:
for record in metadata_json:
    field_name = record["field_name"]

    # Include CTSA fields (ctsa_0, ctsa_1, ...)
    if re.match(r"^ctsa_[0-9]*$", field_name):
        output.append({
            "field_name": field_name,
            "field_label": "label" + field_name[4:]
        })

    # Include mapped fields with valid dropdown options
    if match(field_name, mapped_fields):
        if valid_dropdown_format(record["select_choices_or_calculations"]):
            # Normalize dropdown options
            choices = normalize_choices(record["select_choices_or_calculations"])
            output.append({
                "field_name": field_name,
                "select_choices_or_calculations": choices
            })
```

**Dropdown Normalization:**
```python
# Input: "1, Option A | 2, Option B"
# Output: "1, choice 1 | 2, choice 2"
```

**Usage:**
```bash
python filter_metadata.py mapping.csv metadata.json output.json
```

**Purpose:** Create minimal test metadata files

**Location:** filter_metadata.py:1-58

## Dockerfile Build

Multi-stage build for optimized image size.

**Stage 1: Transform (Dockerfile:1-12)**
```dockerfile
FROM ubuntu:20.04 AS transform

# Install Java, SBT, Scala
RUN apt-get update && apt-get install -y wget openjdk-8-jdk gnupg curl sbt

# Build Spark JAR
COPY ["map-pipeline", "map-pipeline"]
WORKDIR map-pipeline
RUN sbt assembly

# Output: target/scala-2.11/TIC preprocessing-assembly-0.2.0.jar
```

**Stage 2: Final (Dockerfile:15-24)**
```dockerfile
FROM txscience/ctmd-pipeline-reload:v2.11

# Copy Log4j security fix
COPY ["reload4j-1.2.26.jar", "/spark-2.4.8-bin-hadoop2.7/jars/log4j-1.2.17.jar"]

# Copy compiled Spark JAR from stage 1
COPY --from=transform ["map-pipeline/target/scala-2.11/TIC preprocessing-assembly-0.2.0.jar",
                       "TIC preprocessing-assembly.jar"]

ENTRYPOINT ["python3", "application.py"]
```

**Base Image:** `txscience/ctmd-pipeline-reload:v2.11`
- Contains: Python 3, Spark 2.4.8, Haskell Stack, PostgreSQL tools, csvkit
- Pre-configured with all dependencies

**Security:**
- Replaces vulnerable log4j-1.2.17.jar with reload4j-1.2.26.jar

**Location:** Dockerfile:1-24

## Environment Variables

### Required Variables

**Database Configuration:**
```bash
POSTGRES_DATABASE_NAME    # Database name
POSTGRES_USER             # Database user
POSTGRES_PASSWORD         # Database password
POSTGRES_PORT             # Database port
POSTGRES_HOST             # Database host
POSTGRES_DUMP_PATH        # Backup directory path
```

**REDCap Configuration:**
```bash
REDCAP_APPLICATION_TOKEN  # API authentication token
REDCAP_URL_BASE           # API endpoint (e.g., https://redcap.vanderbilt.edu/api/)
```

**Data Paths:**
```bash
AUXILIARY_PATH            # Directory with CSV files to left join
FILTER_PATH               # Directory with CSV files to inner join
BLOCK_PATH                # Directory with CSV files to exclude
```

**Redis Configuration:**
```bash
REDIS_QUEUE_HOST          # Redis host for task queue
REDIS_QUEUE_PORT          # Redis port for task queue
REDIS_QUEUE_DB            # Redis database number for queue
REDIS_LOCK_HOST           # Redis host for distributed locking
REDIS_LOCK_PORT           # Redis port for distributed locking
REDIS_LOCK_DB             # Redis database number for locking
REDIS_LOCK_EXPIRE         # Lock expiration time (seconds)
REDIS_LOCK_TIMEOUT        # Lock acquisition timeout (seconds)
```

**Spark Configuration:**
```bash
SPARK_DRIVER_MEMORY       # Driver memory (e.g., "2g")
SPARK_EXECUTOR_MEMORY     # Executor memory (e.g., "2g")
```

**Pipeline Behavior:**
```bash
RELOAD_SCHEDULE           # "1" to enable daily scheduled reloads
RELOAD_ONE_OFF            # "1" to run sync on startup
SCHEDULE_RUN_TIME         # Time for daily reload (format: "HH:MM")
SERVER                    # "1" to start REST API server
CREATE_TABLES             # "1" to create database schema on startup
INSERT_DATA               # "1" to insert data on startup
```

**Task Configuration:**
```bash
TASK_TIME                 # Maximum task duration (seconds)
```

### Optional Variables

```bash
LOCAL_ENV                      # "true" to enable CORS
DOWNLOAD_REDCAP_DATA           # Override download data flag
DOWNLOAD_REDCAP_DATA_DICTIONARY # Override download metadata flag
DATA_INPUT_FILE_PATH           # Override data file path
DATA_DICTIONARY_INPUT_FILE_PATH # Override metadata file path
BATCH_SIZE                     # REDCap API batch size (default: 10)
PAUSE                          # Used in testing
```

## Data Flow

### Complete Pipeline Flow

```
1. Download Phase
   └─ REDCap API
      ├─ downloadData() → redcap_export.json
      │  ├─ Fetch proposal IDs
      │  ├─ Chunk into batches
      │  ├─ Fetch each batch
      │  └─ Merge results
      └─ downloadDataDictionary() → redcap_data_dictionary_export.json

2. Backup Phase
   └─ backUpDataDictionary()
      ├─ Compare to previous version
      └─ Archive if changed

3. Transform Phase
   └─ etl()
      └─ spark-submit → tic.Transform
         ├─ Read: mapping.json, redcap_export.json, redcap_data_dictionary_export.json
         ├─ Apply: auxiliary data, filters, blocklists
         ├─ Transform: DSL evaluation, ID generation, copy/unpivot operations
         └─ Write: data/tables/*.csv

4. Backup Phase
   └─ backUpDatabase()
      └─ pg_dump → backupDir/timestamp

5. Sync Phase
   └─ syncDatabase()
      ├─ DELETE FROM all tables
      └─ csvsql --insert for each CSV
```

### Incremental Update Flow

```
POST /table/<table>
   └─ uploadFile()
      ├─ Parse CSV/JSON
      └─ Write temporary CSV

   └─ validateTable()
      ├─ Check headers
      ├─ Validate data types
      └─ Apply business rules

   └─ Enqueue task
      └─ Worker: insertDataIntoTable()
         ├─ runFile() - Add columns
         └─ csvsql --insert
```

### Study-Specific Update Flow

```
POST /table/StudySites/column/ProposalID
   └─ uploadFile()
      └─ Temporary CSV with ProposalID column

   └─ validateTable()
      └─ Ensure all ProposalIDs match

   └─ Enqueue task
      └─ Worker: updateDataIntoTableColumn()
         ├─ For each row:
         │  └─ DELETE WHERE ProposalID = value AND siteId = site_value
         └─ csvsql --insert all rows
```

## Key Features

### Asynchronous Task Processing

**Pattern:**
```
Client → REST API → Redis Queue → Worker Process → Database
   ↓         ↓                           ↓
   │    Return Task ID              Process Task
   │                                     ↓
   └─── Poll /task/<id> ─────────── Update Status
```

**Benefits:**
- Non-blocking API responses
- Long-running operations don't timeout
- Task status tracking
- Automatic retries (via RQ)

### Distributed Locking

**Purpose:** Prevent concurrent database modifications

**Scope:** All database write operations

**Mechanism:** Redis-based locks with:
- Automatic expiration (prevents deadlocks)
- Timeout on acquisition (prevents infinite waits)
- Single global lock (G_LOCK)

**Example Scenario:**
```
Request 1: POST /sync (acquires lock)
Request 2: POST /backup (waits for lock)
  → Request 1 completes
  → Request 2 acquires lock
```

### Data Validation

**Multi-Layer Validation:**

1. **Server Layer (server.py):**
   - File format validation
   - Content-type checking
   - Temporary file management

2. **Validation Layer (reload.py:validateTable):**
   - Header validation with fuzzy matching
   - Type validation for each cell
   - Business rule enforcement
   - Returns detailed error messages

3. **Database Layer (PostgreSQL):**
   - Schema constraints
   - Foreign keys (if defined)
   - Data type enforcement

### Chunked REDCap Downloads

**Problem:** Large REDCap exports can timeout or run out of memory

**Solution:** Batch requests by proposal ID range

**Algorithm:**
1. Fetch all proposal IDs (lightweight)
2. Sort by ID
3. Chunk into groups of BATCH_SIZE
4. Fetch each chunk with filterLogic
5. Merge results

**Benefits:**
- Handles large datasets
- More stable network requests
- Progress tracking possible
- Can resume on failure

### Schema-Driven Operations

**Philosophy:** Mapping.json is single source of truth

**Schema Generation:**
- Haskell service reads mapping.json
- Generates SQL CREATE TABLE statements
- Types consistent with mapping

**Data Transformation:**
- Scala service reads mapping.json
- Applies DSL expressions
- Outputs match schema

**Validation:**
- Python service queries information_schema
- Validates against database schema
- Schema drives validation logic

## Testing

### Test Structure

**Test Files:**
```
test/
├── conftest.py          # Pytest configuration
├── test_reload.py       # Core functionality tests (583 lines)
├── test_table.py        # Table operation tests
└── test_utils.py        # Test utilities and helpers
```

**Test Data:**
```
test/
├── redcap/
│   ├── record.json          # Sample REDCap data
│   ├── record2.json         # Additional test data
│   └── metadata.json        # Sample data dictionary
├── auxiliary1/              # Auxiliary data samples
├── auxiliary2/
├── auxiliary3/
├── filter1/                 # Filter data samples
├── filter2/
├── filter3/
├── block1/                  # Blocklist samples
├── block2/
├── block3/
└── tables/                  # Expected table outputs
```

### Key Test Cases

**Data Download Tests:**
```python
def test_downloadData()
    # Downloads from mock REDCap
    # Compares to expected record.json
    # Uses DeepDiff for comparison

def test_downloadDataDictionary()
    # Downloads metadata from mock REDCap
    # Compares to expected metadata.json
```

**Database Tests:**
```python
def test_clear_database()
    # Drops all tables
    # Verifies schema is empty
    # Recreates tables

def test_etl()
    # Runs Spark transformation
    # Verifies output CSV files
    # Checks row counts
```

**Sync Tests:**
```python
def test_sync()
    # Loads CSV data into database
    # Verifies row counts
    # Checks data integrity

def test_entrypoint()
    # Full pipeline execution
    # From REDCap to database
    # Verifies end-to-end flow
```

**Backup/Restore Tests:**
```python
def test_back_up_database()
    # Creates database backup
    # Verifies backup file exists
    # Checks file timestamp

def test_restore_database()
    # Restores from backup
    # Verifies data restored correctly
    # Checks row counts
```

**Filter Tests:**
```python
def test_auxiliary1()
    # Tests left join of auxiliary data
    # Verifies additional columns added

def test_filter1()
    # Tests inner join filtering
    # Verifies row count changes

def test_blocklist1()
    # Tests blocklist exclusion
    # Verifies blocked rows removed
```

**API Tests:**
```python
def test_sync_endpoint()
    # POST /sync
    # Verifies task ID returned
    # Checks task status

def test_back_up_endpoint()
    # GET /backup
    # Verifies backup list returned

def test_task()
    # Tests task queue operations
    # Verifies status transitions
```

**Locking Tests:**
```python
def test_back_up_database_with_lock()
    # Verifies distributed locking
    # Tests concurrent operations

def test_restore_database_with_lock()
    # Tests lock acquisition
    # Verifies lock release
```

### Test Utilities

**Context Managers (test_reload.py:82-126):**

```python
@contextmanager
def copy_file(fromp, top):
    # Temporarily copy file for test
    # Automatically cleanup

@contextmanager
def copytree(fromp, top):
    # Temporarily copy directory
    # Automatically cleanup

@contextmanager
def datatables(nextvalue):
    # Run function that creates data/tables/
    # Automatically cleanup output

@contextmanager
def database(ctx, cleanup=True):
    # Setup test database
    # Automatically restore schema

@contextmanager
def connection(ctx, autocommit=False):
    # Create database connection
    # Automatically close
```

**Test Helpers (test_utils.py):**

```python
WAIT_PERIOD = 5  # Seconds to wait for services to start

def wait_for_task_to_start(task_id):
    # Poll until task status is "started"

def wait_for_task_to_finish(task_id):
    # Poll until task status is "finished" or "failed"

def bag_contains(subset, superset):
    # Check if all items in subset are in superset

def bag_equal(list1, list2):
    # Check if lists contain same items (ignoring order)
```

### Running Tests

**Docker Compose Setup:**
```bash
cd services/pipeline/test
docker-compose down
docker-compose up --build --exit-code-from pipeline
```

**Services Started:**
- PostgreSQL database
- Redis (queue and lock)
- Mock REDCap API
- Pipeline container

**Test Execution:**
- Runs pytest in pipeline container
- Exits with code 0 on success
- Exits with non-zero on failure

## Integration Points

### Upstream Dependencies

1. **REDCap API**
   - Data source
   - Metadata source
   - Must be accessible via HTTPS

2. **map-pipeline (Scala/Spark)**
   - Data transformation
   - Generates CSV files
   - JAR must be built and available

3. **map-pipeline-schema (Haskell)**
   - Schema generation
   - Generates SQL CREATE TABLE statements
   - Must be compiled with Stack

### Downstream Consumers

1. **PostgreSQL Database**
   - Stores transformed data
   - Queried by dashboard application
   - Requires schema from map-pipeline-schema

2. **Dashboard Application**
   - Consumes data via SQL queries
   - May trigger pipeline via REST API
   - May upload incremental updates

3. **Backup Storage**
   - Stores pg_dump files
   - Stores data dictionary archives
   - Must have sufficient disk space

### External Services

1. **Redis (Queue)**
   - Task queue storage
   - Worker coordination
   - Must be highly available

2. **Redis (Lock)**
   - Distributed locking
   - Can be same instance as queue
   - Must be highly available

## Limitations and Constraints

### Concurrency

1. **Single Global Lock**
   - All database operations serialized
   - No parallel writes possible
   - High contention under heavy load

2. **No Read Locks**
   - Reads can occur during writes
   - May see inconsistent data mid-sync
   - No transaction isolation guarantees

### Scalability

1. **Single Worker Process**
   - Tasks processed sequentially
   - Long-running tasks block others
   - No horizontal scaling

2. **In-Memory Spark**
   - Spark master is "local[*]"
   - Limited by single machine memory
   - Cannot distribute across cluster

3. **csvkit Performance**
   - Python-based CSV parsing
   - Slower than native PostgreSQL COPY
   - Row-by-row insertion

### Data Consistency

1. **Sync is Destructive**
   - DELETE all rows then INSERT
   - No transactional boundary
   - Failure mid-sync leaves empty tables

2. **No Rollback**
   - Failed syncs don't auto-rollback
   - Must manually restore from backup
   - Data loss possible

3. **Backup Timing**
   - Backup occurs before sync
   - Backup doesn't include new data
   - Restore loses incremental updates

### Error Handling

1. **Subprocess Failures**
   - spark-submit, csvsql, pg_dump errors
   - Only return code checked
   - No stderr capture or logging

2. **Task Failures**
   - Failed tasks stay in failed registry
   - No automatic retry logic
   - Manual intervention required

3. **Partial Failures**
   - If table 5 of 20 fails insertion
   - Previous 4 tables inserted
   - No transaction across tables

### Validation

1. **Limited Schema Validation**
   - Only checks column existence
   - Doesn't validate foreign keys
   - Doesn't check constraints

2. **No Data Range Validation**
   - Dates can be any valid date
   - Numbers can be any valid number
   - No business rule engine

3. **Special Case Handling**
   - StudySites ProposalID check hardcoded
   - No extensible validation framework
   - Adding rules requires code changes

## Security Considerations

### Credentials

1. **Environment Variables**
   - Database passwords in plaintext
   - REDCap tokens in plaintext
   - Visible in process list

2. **.pgpass File**
   - Written to home directory
   - Contains database credentials
   - Proper permissions set (0600)

3. **Redis**
   - No authentication configured
   - Anyone with network access can:
     - View/modify task queue
     - Acquire/release locks
     - Read task arguments

### API Security

1. **No Authentication**
   - REST API has no auth
   - Anyone can trigger operations
   - Anyone can view task details

2. **No Authorization**
   - No user roles
   - No operation permissions
   - No audit logging

3. **CORS**
   - Disabled by default
   - Enabled in local dev (LOCAL_ENV=true)
   - Allows cross-origin requests

### SQL Injection

1. **Parameterized Queries**
   - Most queries use parameters
   - Good: `cursor.execute(query, (value,))`

2. **String Formatting**
   - Some queries use string formatting
   - `checkId()` function prevents quotes
   - Still vulnerable to other SQL syntax

3. **Table Names**
   - User-provided table names
   - Only validated for quotes
   - Could be vulnerable

### File System

1. **Temporary Files**
   - NamedTemporaryFile with delete=False
   - Must be manually deleted
   - Race condition possible

2. **Backup Directory**
   - Backup files accessible
   - Contains full database dumps
   - No encryption

3. **Upload Directory**
   - CSV/JSON files uploaded
   - No virus scanning
   - No file size limits enforced

## Performance Considerations

### Bottlenecks

1. **Spark Initialization**
   - ~30 seconds to start SparkContext
   - Happens every ETL run
   - No persistent cluster

2. **CSV Parsing**
   - csvkit is Python-based
   - Slower than PostgreSQL COPY
   - No bulk loading

3. **Serial Processing**
   - One table at a time
   - Global lock prevents parallelism
   - No pipeline parallelism

### Optimization Opportunities

1. **Use COPY Instead of INSERT**
   ```python
   # Current: csvsql --insert (row-by-row)
   # Better: COPY table FROM file (bulk)
   ```

2. **Persistent Spark Context**
   - Keep Spark cluster running
   - Submit jobs to existing cluster
   - Eliminate startup overhead

3. **Parallel Table Loading**
   - Load independent tables in parallel
   - Fine-grained locking per table
   - Reduce total sync time

4. **Incremental Sync**
   - Track changed records
   - Only update deltas
   - Avoid full DELETE/INSERT

### Resource Usage

**Spark Memory:**
- Driver: Configurable (default 2g)
- Executor: Configurable (default 2g)
- Total: 4g+ for Spark alone

**Python Memory:**
- Flask server: ~100MB
- RQ worker: ~100MB
- CSV parsing: Variable (depends on file size)

**Disk Space:**
- Backups: 1 per sync + manual backups
- CSV files: Temporary during sync
- Docker images: ~2GB

## Future Enhancements

### Recommended Improvements

1. **Transaction Support**
   - Wrap sync in PostgreSQL transaction
   - Rollback on failure
   - Ensure consistency

2. **Authentication/Authorization**
   - Add API key authentication
   - Role-based access control
   - Audit logging

3. **Better Error Handling**
   - Capture subprocess stderr
   - Structured logging
   - Error notifications (email, Slack)

4. **Performance**
   - Use PostgreSQL COPY
   - Persistent Spark cluster
   - Parallel table loading

5. **Monitoring**
   - Prometheus metrics
   - Health check endpoints
   - Task duration tracking

6. **Data Validation**
   - Extensible validation framework
   - Business rule engine
   - Custom validators per table

## Summary

The Pipeline Service is a comprehensive orchestration layer that manages the complete ETL workflow for CTMD. Built in Python with Flask, it provides:

**Strengths:**
- RESTful API for all pipeline operations
- Asynchronous task processing via Redis Queue
- Distributed locking for safe concurrent operations
- Comprehensive data validation
- Backup and restore capabilities
- Flexible incremental update mechanisms
- Well-tested with extensive test coverage
- Dockerized for consistent deployment

**Architecture:**
- Multi-process design (API server, worker, scheduler)
- Integration with Spark (Scala) and Haskell services
- Redis-based task queue and locking
- PostgreSQL database backend
- REDCap API integration with chunked downloads

**Workflow:**
1. Download: REDCap → JSON files
2. Transform: Spark ETL → CSV files
3. Backup: Database → pg_dump
4. Sync: CSV files → PostgreSQL

**API Features:**
- Full CRUD for database backups
- Table read/write/update operations
- Incremental updates by column
- Task status tracking
- Async job processing

The service is production-ready but has opportunities for improvement in transaction safety, authentication, performance optimization, and error handling. It successfully orchestrates complex multi-step ETL workflows while providing a clean REST API for management operations.

## Version Information

**Current Version:** 2.5+ (based on Docker image tags)

**Component Versions:**
- Python: 3.x
- Spark: 2.4.8
- PostgreSQL: Client tools for target version
- Redis: Any compatible version
- Haskell Stack: For map-pipeline-schema

## References

- map-pipeline-report.md - Scala/Spark transformation service
- map-pipeline-schema-report.md - Haskell schema generation service
- [Flask Documentation](https://flask.palletsprojects.com/)
- [Redis Queue Documentation](https://python-rq.org/)
- [Sherlock Documentation](https://github.com/vaidik/sherlock)
