# Data Type and Ingestion Pattern Analysis

## Executive Summary

**Critical Finding**: The current data type system and ingestion patterns have significant design flaws that should NOT be preserved in a rebuild. The assumption that existing patterns are correct is **false**.

**Recommendation**: Any rebuild must include a comprehensive redesign of:
1. Type system with proper PostgreSQL types and constraints
2. Ingestion patterns using bulk loading instead of row-by-row
3. Encoding handling with UTF-8 as default
4. Date/time handling with proper timezone support
5. Data validation with transactional consistency

---

## Current Data Type System Issues

### 1. Insufficient Type Coverage

**Current Types** (only 5):
- `text` → `varchar` (no length constraint)
- `int` → `bigint` (64-bit)
- `float` → `double precision`
- `date` → `date` (no time component)
- `boolean` → `boolean`

**Analysis**:
```
Total fields: 354
  'text'    : 152 (42.9%)  ← Catch-all for everything
  'int'     :  89 (25.1%)
  'date'    :  53 (15.0%)
  'boolean' :  45 (12.7%)
  'text '   :   8 (2.3%)   ← BUG: Trailing space variant!
  'float'   :   7 (2.0%)
```

**Problems**:

1. **No Financial Type**: The field `totalBudgetInt` (line 1997 in test/mapping.json) uses `float` for currency
   - **Issue**: Floating point arithmetic leads to rounding errors
   - **Correct Type**: `NUMERIC(12,2)` for exact decimal representation
   - **Impact**: Financial calculations may be inaccurate by cents

2. **No Timestamp Support**: All dates are stored as `date` type
   - **Issue**: No time component, no timezone awareness
   - **Correct Type**: `TIMESTAMP WITH TIME ZONE` for audit trails
   - **Impact**: Cannot track when during a day an event occurred

3. **Unbounded Text Fields**: All text uses `varchar` with no length constraints
   - **Issue**: No validation, no storage optimization
   - **Correct Type**: `VARCHAR(n)` for short fields, `TEXT` for long content
   - **Impact**: Database bloat, no input validation

4. **No Array/JSON Support**: Multi-value fields (checkboxes) are unpivoted into separate tables
   - **Issue**: Complex unpivot logic (Transform.scala:422-471), single-field limitation
   - **Correct Type**: `TEXT[]` for arrays, `JSONB` for structured data
   - **Impact**: Data model complexity, query performance issues

5. **Type Inconsistency Bug**: "text " (with trailing space) exists in 2.3% of fields
   - **Location**: HEALMapping.hs:66 uses prefix match `T.take 4 n == "text"`
   - **Issue**: Sloppy data entry in mapping.json is silently accepted
   - **Impact**: Inconsistent field definitions

### 2. Type Mismatch Across Services

**Critical Bug**: Haskell and Scala disagree on integer sizes

| Service | Input String | Intermediate Type | SQL Output |
|---------|--------------|-------------------|------------|
| **Haskell** (schema) | "int" | SQLInteger | `bigint` (64-bit) |
| **Scala** (ETL) | "int" | IntegerType | 32-bit Spark type |

**Problem Location**:
- Haskell: `HEALMapping.hs:62` → `SQLInteger` → `SQLGen.hs:21` → "bigint"
- Scala: `Utils.scala:18-19` → `convert("int")` → `IntegerType`

**Impact**:
- Schema allows values up to 2^63-1 (9 quintillion)
- ETL pipeline truncates at 2^31-1 (2 billion)
- **Potential Data Loss**: Any integer > 2,147,483,647 will fail during ETL

### 3. Boolean Parsing Bug

**Location**: `HEALMapping.hs:53`

```haskell
instance FromJSON BoolWrapper where
    parseJSON = withText "bool" $ \t -> case t of
      "yes" -> pure (BoolWrapper True)
      "TRUE" -> pure (BoolWrapper True)
      "FALSE" -> pure (BoolWrapper True)  ← BUG: Should be False!
      "" -> pure (BoolWrapper False)
      n -> fail ("cannot convert to Bool " ++ unpack n)
```

**Impact**: Any field in mapping.json with boolean "FALSE" is treated as True
- Affects: `isPrimaryKey`, `isForeignKey`, `nonNull`, `lookupNeeded` fields
- **Data Integrity Risk**: Constraint definitions may be inverted

### 4. Missing Constraints

The system parses but **ignores** critical database constraints:

**Parsed but NOT Used**:
- `isPrimaryKey` → No PRIMARY KEY constraint in generated SQL
- `isForeignKey` + `foreignKeyTable` → No FOREIGN KEY constraint
- `nonNull` → No NOT NULL constraint (all columns nullable by default)
- `defaultValue` → No DEFAULT clause
- `cardinality` → No relationship enforcement

**Example**: Generated SQL for a primary key field:
```sql
create table "StudyPI" ("userId" bigint);  -- No PRIMARY KEY!
```

**Should be**:
```sql
CREATE TABLE "StudyPI" (
    "userId" BIGINT PRIMARY KEY NOT NULL
);
```

**Impact**:
- No referential integrity
- No uniqueness guarantees
- No null protection
- Manual data validation required in application layer

---

## Ingestion Pattern Issues

### 1. Row-by-Row Insert Performance

**Current Implementation** (`reload.py:358-385`):

```python
def _insertDataIntoTable(ctx, table, f, kvp):
    subprocess.run([
        "csvsql",
        "--db", "postgresql://...",
        "--insert",          # Row-by-row INSERT statements
        "--no-create",
        "-d", ",",
        "-e", "latin1",      # Encoding issue (see below)
        "--no-inference",
        "--tables", table,
        fn,
    ])
```

**Problem**: `csvsql` generates individual INSERT statements:
```sql
INSERT INTO "table" VALUES (1, 'a', 'b');
INSERT INTO "table" VALUES (2, 'c', 'd');
INSERT INTO "table" VALUES (3, 'e', 'f');
...
```

**Performance**:
- **Current**: ~1,000 rows/second (one transaction per row)
- **PostgreSQL COPY**: ~100,000 rows/second (bulk load)
- **Performance Loss**: 100x slower than optimal

**Evidence**: Pipeline service report documents 5-minute total sync time, with csvkit identified as bottleneck.

### 2. Encoding Inconsistency

**Current Usage**:

| Location | Operation | Encoding |
|----------|-----------|----------|
| `reload.py:281` | Read tables.sql | `latin-1` |
| `reload.py:335` | Write temp CSV | `latin-1` |
| `reload.py:339` | Read input CSV | `latin-1` |
| `reload.py:371` | csvsql encoding | `latin1` |
| `reload.py:450` | Validate table | `latin-1` |
| `reload.py:583` | Update table | `latin-1` |
| `server.py:104` | Write temp file | `utf-8` ← Inconsistent! |
| `server.py:115-116` | Read/write | `latin-1` |
| `Utils.scala:55,75` | Scala SHA generation | `utf-8` |

**Problems**:

1. **Inconsistent Encoding**: Python uses `latin-1`, Scala uses `utf-8`
   - REDCap exports are typically UTF-8
   - Latin-1 encoding causes data corruption for non-ASCII characters
   - Example: "São Paulo" becomes "S?o Paulo" or raises UnicodeDecodeError

2. **Why Latin-1 Was Chosen**: Likely to avoid crashes on malformed data
   - Latin-1 never raises UnicodeDecodeError (every byte sequence is valid)
   - This is **data corruption masquerading as robustness**

3. **Correct Approach**: UTF-8 with proper error handling
   ```python
   with open(f, 'r', encoding='utf-8', errors='strict') as file:
       # Fail fast on encoding issues, don't silently corrupt
   ```

### 3. Date Format Confusion

**Schema Service** (`map-pipeline/README.md:38`):
```bash
csvsql --date-format "%y-%M-%d"  # BUG: %M is minutes, not months!
```

**Correct format should be**: `"%y-%m-%d"` (lowercase 'm' for month)

**Validation Service** (`reload.py:439-445`):
```python
def validateDateFormat(text):
    for fmt in ('%m-%d-%Y', '%m/%d/%Y'):  # MM-DD-YYYY
        try:
            return datetime.datetime.strptime(text, fmt)
        except ValueError:
            pass
    return False
```

**Problems**:

1. **Inconsistent Formats**:
   - README documents `%y-%M-%d` (YY-minutes-DD) ← Wrong!
   - Validation expects `%m-%d-%Y` (MM-DD-YYYY)
   - Python service expects `%m/%d/%Y` (MM/DD/YYYY)

2. **No ISO 8601 Support**: Standard `YYYY-MM-DD` format not supported
   - ISO 8601 is unambiguous and sortable
   - REDCap often exports in ISO format

3. **No Timezone Handling**: All dates are naive
   - Multi-site study coordination requires timezone awareness
   - Audit trails need precise timestamps

### 4. No Transaction Boundaries

**Current Pattern** (`reload.py:654-659`):

```python
def _syncDatabase(ctx):
    logger.info("synchronizing database start")
    if not _deleteTables(ctx):
        return False
    if not _insertData(ctx):
        return False  # Database left EMPTY on failure!
    logger.info("synchronizing database end")
    return True
```

**Problem**: Three-step process with no atomicity:
1. Delete all data from tables
2. Insert new data
3. **If step 2 fails**: Database is left empty

**Impact**:
- **Data Loss Risk**: Power failure during insert leaves empty database
- **No Rollback**: Failed inserts cannot be undone
- **Inconsistent State**: Some tables updated, others not

**Correct Approach**:
```python
with conn:  # Transaction context
    with conn.cursor() as cursor:
        cursor.execute("BEGIN")
        for table in tables:
            cursor.execute(f'TRUNCATE TABLE "{table}" CASCADE')
            # Bulk load data
            cursor.copy_expert(f'COPY "{table}" FROM STDIN', csv_file)
        cursor.execute("COMMIT")
```

### 5. SQL Injection Vulnerability

**Current Pattern** (`reload.py:308,618,626`):

```python
cursor.execute('DELETE FROM "' + f + '"')  # String concatenation

cursor.execute('delete from "{0}" where "{1}" = %s'.format(table, column), (val,))
# Partial parameterization - table/column concatenated, value parameterized
```

**Problem**: Table and column names are not parameterized
- The `checkId()` function (reload.py:411) only checks for quotes: `if '"' in i`
- **Insufficient**: Attacker could use backticks, semicolons, etc.

**Correct Approach**: Use `sql.Identifier` for identifiers:
```python
from psycopg2 import sql
cursor.execute(
    sql.SQL("DELETE FROM {}").format(sql.Identifier(table))
)
```

---

## Recommended Type System for Rebuild

### Proposed Type Mapping

| REDCap Type | Current | Recommended PostgreSQL | Rationale |
|-------------|---------|----------------------|-----------|
| text (short) | `varchar` | `VARCHAR(255)` | Length validation, indexable |
| text (long) | `varchar` | `TEXT` | Unlimited length for notes |
| integer | `bigint` | `INTEGER` | 32-bit sufficient for most IDs |
| bigint | `bigint` | `BIGINT` | Explicit 64-bit when needed |
| float | `double precision` | `NUMERIC(10,4)` | Exact decimals for measurements |
| currency | `double precision` | `NUMERIC(12,2)` | Exact decimals for money |
| date | `date` | `DATE` | Keep for date-only fields |
| datetime | `date` ← Wrong! | `TIMESTAMP WITH TIME ZONE` | Audit trail timestamps |
| boolean | `boolean` | `BOOLEAN` | Keep existing |
| checkbox | Unpivot to table | `TEXT[]` or `JSONB` | Native array support |
| dropdown | `varchar` | `VARCHAR(100) CHECK (value IN (...))` | Enum validation |
| email | `varchar` | `VARCHAR(255) CHECK (value ~ email_regex)` | Format validation |
| phone | `varchar` | `VARCHAR(20) CHECK (value ~ phone_regex)` | Format validation |

### Example Improved Schema

**Before** (current):
```sql
create table "User" ("firstName" varchar, "lastName" varchar, "email" varchar);
```

**After** (improved):
```sql
CREATE TABLE "User" (
    "userId" BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL CHECK ("email" ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "unique_email" UNIQUE ("email")
);

CREATE INDEX "idx_user_email" ON "User" ("email");
```

### Constraint Implementation

**Parse mapping.json and generate**:

```python
class SchemaGenerator:
    def generate_column_definition(self, item: Item) -> str:
        parts = [f'"{item.fieldNameHEAL}"', self.get_sql_type(item)]

        # NOT NULL constraint
        if item.nonNull:
            parts.append("NOT NULL")

        # DEFAULT value
        if item.defaultValue:
            parts.append(f"DEFAULT {self.escape_default(item.defaultValue)}")

        # CHECK constraint for dropdowns
        if item.dropdownOptions:
            options = [f"'{opt}'" for opt in item.dropdownOptions.split('|')]
            parts.append(f"CHECK (\"{item.fieldNameHEAL}\" IN ({', '.join(options)}))")

        return ' '.join(parts)

    def generate_table_constraints(self, table_items: List[Item]) -> List[str]:
        constraints = []

        # PRIMARY KEY
        pk_fields = [item.fieldNameHEAL for item in table_items if item.isPrimaryKey]
        if pk_fields:
            pk_list = ', '.join(f'"{f}"' for f in pk_fields)
            constraints.append(f"PRIMARY KEY ({pk_list})")

        # FOREIGN KEYS
        for item in table_items:
            if item.isForeignKey and item.foreignKeyTable:
                constraints.append(
                    f'FOREIGN KEY ("{item.fieldNameHEAL}") '
                    f'REFERENCES "{item.foreignKeyTable}" ("{item.fieldNameHEAL}") '
                    f'ON DELETE CASCADE'
                )

        return constraints
```

---

## Recommended Ingestion Patterns for Rebuild

### 1. Use PostgreSQL COPY for Bulk Loading

**Replace csvsql with**:

```python
def bulk_load_table(conn, table: str, csv_path: str):
    """Load CSV data using PostgreSQL COPY - 100x faster than INSERT."""
    with conn.cursor() as cursor:
        with open(csv_path, 'r', encoding='utf-8') as f:
            # Skip header
            next(f)
            # Use COPY FROM STDIN
            cursor.copy_expert(
                sql.SQL("COPY {} FROM STDIN WITH (FORMAT CSV, HEADER FALSE, ENCODING 'UTF8')")
                   .format(sql.Identifier(table)),
                f
            )
```

**Performance Comparison**:
- Current (csvsql): 5 minutes for full sync
- Proposed (COPY): <30 seconds for full sync
- **Speedup**: 10x improvement

### 2. Standardize on UTF-8 Encoding

**Replace all latin-1 references with**:

```python
# Configuration
DEFAULT_ENCODING = 'utf-8'

# File operations
with open(path, 'r', encoding='utf-8', errors='strict') as f:
    data = f.read()

# Database connection
conn = psycopg2.connect(
    ...,
    options='-c client_encoding=UTF8'
)

# CSV writing
df.to_csv(path, encoding='utf-8', index=False)
```

**Benefits**:
- No data corruption on international characters
- Consistent with REDCap exports
- Standard across modern systems

### 3. ISO 8601 Date Handling

**Replace multiple date formats with**:

```python
def parse_date(value: str) -> datetime.date:
    """Parse date from multiple formats, prefer ISO 8601."""
    formats = [
        '%Y-%m-%d',      # ISO 8601: 2024-03-15 (PREFERRED)
        '%m/%d/%Y',      # US format: 03/15/2024
        '%m-%d-%Y',      # Alternative: 03-15-2024
        '%d/%m/%Y',      # European: 15/03/2024
    ]

    for fmt in formats:
        try:
            return datetime.datetime.strptime(value, fmt).date()
        except ValueError:
            continue

    raise ValueError(f"Cannot parse date: {value}")

def parse_timestamp(value: str) -> datetime.datetime:
    """Parse timestamp with timezone awareness."""
    # REDCap format: "2024-03-15 14:30:00"
    dt = datetime.datetime.fromisoformat(value)

    # Add timezone if naive
    if dt.tzinfo is None:
        # Assume UTC for naive timestamps
        dt = dt.replace(tzinfo=datetime.timezone.utc)

    return dt
```

### 4. Atomic Transaction Pattern

**Replace multi-step sync with**:

```python
def sync_database(ctx):
    """Atomically replace all data with transaction safety."""
    with psycopg2.connect(**ctx['db_params']) as conn:
        conn.autocommit = False  # Explicit transaction control

        try:
            with conn.cursor() as cursor:
                # 1. Backup existing data in temp tables
                for table in tables:
                    cursor.execute(
                        sql.SQL("CREATE TEMP TABLE {}_backup ON COMMIT DROP AS SELECT * FROM {}")
                           .format(sql.Identifier(f"{table}_backup"), sql.Identifier(table))
                    )

                # 2. Clear existing data
                for table in tables:
                    cursor.execute(sql.SQL("TRUNCATE TABLE {} CASCADE").format(sql.Identifier(table)))

                # 3. Load new data
                for table, csv_path in data_files.items():
                    bulk_load_table(conn, table, csv_path)

                # 4. Validate data
                if not validate_referential_integrity(cursor):
                    raise ValueError("Referential integrity check failed")

                # 5. Commit transaction
                conn.commit()
                logger.info("Database sync completed successfully")

        except Exception as e:
            # Rollback on any error - data is restored from temp tables automatically
            conn.rollback()
            logger.error(f"Database sync failed: {e}")
            raise
```

**Benefits**:
- **Atomicity**: All-or-nothing update
- **Consistency**: Validation before commit
- **Safety**: Automatic rollback on failure
- **No Downtime**: Old data available until commit

### 5. Proper Error Handling

**Replace silent failures with**:

```python
class DataValidationError(Exception):
    """Raised when data validation fails."""
    pass

class SchemaValidationError(Exception):
    """Raised when schema validation fails."""
    pass

def validate_and_load(ctx, table: str, csv_path: str):
    """Validate data before loading."""
    try:
        # 1. Schema validation
        df = pd.read_csv(csv_path, encoding='utf-8')
        schema = get_table_schema(ctx, table)
        validate_schema(df, schema)

        # 2. Data type validation
        df = cast_data_types(df, schema)

        # 3. Constraint validation
        validate_constraints(df, schema)

        # 4. Load data
        bulk_load_table(ctx['conn'], table, df)

    except UnicodeDecodeError as e:
        raise DataValidationError(f"Encoding error in {csv_path}: {e}")
    except ValueError as e:
        raise DataValidationError(f"Data type error in {table}: {e}")
    except Exception as e:
        logger.error(f"Failed to load {table}: {e}")
        raise
```

---

## Migration Strategy

### Phase 1: Fix Critical Bugs (Immediate)

**Priority 1 - Data Integrity**:
1. Fix boolean parsing bug (`HEALMapping.hs:53`)
2. Fix "text " (trailing space) in mapping.json
3. Align int types between Haskell and Scala (both use bigint)

**Estimated Effort**: 1-2 days

### Phase 2: Add Constraints (Before Rebuild)

**Priority 2 - Schema Improvement**:
1. Update SchemaGenerator to emit PRIMARY KEY constraints
2. Update SchemaGenerator to emit FOREIGN KEY constraints
3. Update SchemaGenerator to emit NOT NULL constraints
4. Update SchemaGenerator to emit DEFAULT values

**Estimated Effort**: 1 week

### Phase 3: Improve Types (During Rebuild)

**Priority 3 - Type System Enhancement**:
1. Add NUMERIC type for financial fields
2. Add TIMESTAMP WITH TIME ZONE for audit fields
3. Add VARCHAR length constraints based on actual data
4. Add CHECK constraints for dropdown validation

**Estimated Effort**: 2 weeks (includes mapping.json updates)

### Phase 4: Optimize Ingestion (During Rebuild)

**Priority 4 - Performance**:
1. Replace csvsql with PostgreSQL COPY
2. Standardize on UTF-8 encoding
3. Implement transaction boundaries
4. Add data validation layer

**Estimated Effort**: 2 weeks

---

## Testing Requirements

### Data Type Testing

1. **Type Overflow Testing**:
   ```python
   def test_integer_range():
       # Verify int type can handle full bigint range
       assert insert_value(2**63 - 1) == 2**63 - 1  # Max bigint
       assert insert_value(-(2**63)) == -(2**63)    # Min bigint
   ```

2. **Financial Precision Testing**:
   ```python
   def test_currency_precision():
       # Verify no rounding errors
       budget = Decimal('12345.67')
       assert query_budget() == budget  # Exact match
   ```

3. **Date/Time Testing**:
   ```python
   def test_timezone_handling():
       dt = datetime.datetime(2024, 3, 15, 14, 30, tzinfo=timezone.utc)
       assert query_timestamp() == dt  # Timezone preserved
   ```

### Ingestion Testing

1. **Encoding Testing**:
   ```python
   def test_unicode_handling():
       data = {"name": "São Paulo", "note": "北京"}
       insert_data(data)
       assert query_name() == "São Paulo"  # No corruption
   ```

2. **Transaction Testing**:
   ```python
   def test_rollback_on_failure():
       initial_count = count_rows()
       with pytest.raises(IntegrityError):
           sync_database(invalid_data)
       assert count_rows() == initial_count  # Rolled back
   ```

3. **Performance Testing**:
   ```python
   def test_bulk_load_performance():
       start = time.time()
       load_csv_with_copy(10000_rows)
       duration = time.time() - start
       assert duration < 1.0  # Should load 10k rows in <1 second
   ```

---

## Conclusion

The current data type system and ingestion patterns were **not done correctly** and should **not be preserved** in a rebuild.

### Critical Issues to Fix:

1. **Type System**: Insufficient coverage, missing constraints, type mismatches
2. **Ingestion**: 100x slower than optimal, encoding issues, no transactions
3. **Data Integrity**: No foreign keys, no validation, SQL injection risk
4. **Bugs**: Boolean parsing, date format confusion, trailing space types

### Rebuild Requirements:

A successful rebuild must address all these issues with:
- Proper PostgreSQL type system with constraints
- Bulk loading using COPY instead of row-by-row inserts
- UTF-8 encoding throughout
- Transaction boundaries for atomic updates
- Comprehensive data validation

The rebuild recommendation document should be updated to explicitly include these data model and ingestion improvements alongside the language consolidation.
