# Database Restore Troubleshooting Guide

**Date:** 2025-01-25
**System:** CTMD Dashboard - PostgreSQL 11.22
**Environment:** Kubernetes (ctmd namespace)

## Issue Summary

When attempting to restore production database backups to a fresh PostgreSQL deployment, multiple issues were encountered that prevented successful data restoration, particularly for the `ProposalDetails` and `ProposalFunding` tables.

---

## Problems Encountered

### Problem 1: Invalid Command Errors with COPY Statements

**Symptoms:**
```
psql:/tmp/backup-seals.sql:13050: invalid command \N
psql:/tmp/backup-seals.sql:13089: invalid command \n-Aspire
psql:/tmp/backup-seals.sql:13155: ERROR: syntax error at or near "suicide"
```

**Root Cause:**
The backup files contained COPY statements with embedded newlines within text fields (particularly in the `InitialConsultationSummary` table which contains long-form consultation notes). PostgreSQL's COPY format uses literal `\N` to represent NULL values and allows multi-line text within fields. However, when restoring via `psql -f`, the parser was having difficulty distinguishing between:
- Data newlines within COPY statements
- SQL statement terminators
- The `\N` NULL markers were being interpreted as commands outside of COPY context

**Impact:**
- Non-fatal errors during restore
- Some tables (`InitialConsultationSummary`) had formatting issues but data was partially loaded
- Other tables restored successfully despite the errors

---

### Problem 2: Empty Critical Tables (ProposalDetails & ProposalFunding)

**Symptoms:**
```sql
SELECT COUNT(*) FROM "ProposalDetails";  -- Result: 0
SELECT COUNT(*) FROM "ProposalFunding";  -- Result: 0
```

Despite the backup file containing 665 rows for each table, they remained empty after restore.

**Root Cause:**
The tables already existed in the database with an **incompatible schema**. When the restore script tried to load data, it encountered schema mismatches:
```
ERROR: column "notableRisk" of relation "ProposalDetails" does not exist
```

The existing table schema didn't match the backup schema, so the COPY statements failed silently or were skipped during the restore process.

**Why This Happened:**
When deploying the application for the first time, the pipeline service's `CREATE_TABLES` setting created the tables with a certain schema. However, the production backup was from a database with a different (newer/older) schema version that included additional columns like `notableRisk`.

---

### Problem 3: Duplicate Data After Multiple Restore Attempts

**Symptoms:**
```sql
SELECT "ProposalID", COUNT(*) FROM "Proposal" GROUP BY "ProposalID" HAVING COUNT(*) > 1;
-- Result: Each proposal appeared 5 times
```

**Root Cause:**
After attempting multiple restore strategies:
1. First restore: All tables except ProposalDetails/ProposalFunding populated
2. Dropped ProposalDetails and ProposalFunding tables
3. Second restore: Tables were recreated with correct schema and populated
4. **Problem:** Second restore re-inserted data into ALL tables, creating duplicates in tables that already had data

The `CREATE TABLE IF NOT EXISTS` statements in the backup didn't create tables that already existed, but the `COPY` statements still executed and appended data.

---

## Solution Steps

### Step 1: Identify Missing Data

Verify which tables had data:
```bash
ks exec -n ctmd ctmd-db-5bc7c4787b-5s64b -- psql -U ctmd-user -d postgres -c "
  SELECT 'Proposal' as table_name, COUNT(*) FROM \"Proposal\"
  UNION ALL SELECT 'ProposalDetails', COUNT(*) FROM \"ProposalDetails\"
  UNION ALL SELECT 'ProposalFunding', COUNT(*) FROM \"ProposalFunding\";"
```

Result showed Proposal had data but ProposalDetails and ProposalFunding were empty.

---

### Step 2: Attempted INSERT Statement Conversion (Not Used in Final Solution)

Created a Python script to convert COPY statements to INSERT statements to handle embedded newlines properly:

```python
# /tmp/convert_copy_to_insert.py
import sys
import re

def escape_sql_string(value):
    if value == '\\N':
        return 'NULL'
    if value == 'f':
        return 'false'
    if value == 't':
        return 'true'
    # Check if it's a number
    if re.match(r'^-?\d+(\.\d+)?$', value):
        return value
    # It's a string - escape single quotes and wrap in quotes
    escaped = value.replace("'", "''")
    return f"'{escaped}'"

table_name = sys.argv[1]
columns = []
in_copy = False

for line in sys.stdin:
    line = line.rstrip('\n')

    if line.startswith('COPY'):
        # Extract column names
        match = re.search(r'\((.*?)\)', line)
        if match:
            columns = [col.strip().strip('"') for col in match.group(1).split(',')]
        in_copy = True
        continue

    if line == '\\.':
        break

    if in_copy and columns:
        # Split by tab
        values = line.split('\t')
        if len(values) == len(columns):
            escaped_values = [escape_sql_string(v) for v in values]
            col_str = ', '.join([f'"{col}"' for col in columns])
            val_str = ', '.join(escaped_values)
            print(f'INSERT INTO public."{table_name}" ({col_str}) VALUES ({val_str});')
```

**Result:** This approach failed because the schema mismatch issue still existed - the script generated INSERT statements with the `notableRisk` column that didn't exist in the target tables.

---

### Step 3: Drop Tables with Incompatible Schema

Recognized that the schema mismatch was the core issue. Dropped the problematic tables:

```bash
ks exec -n ctmd ctmd-db-5bc7c4787b-5s64b -- psql -U ctmd-user -d postgres -c '
  DROP TABLE IF EXISTS "ProposalDetails" CASCADE;
  DROP TABLE IF EXISTS "ProposalFunding" CASCADE;'
```

---

### Step 4: Partial Restore Attempt

Ran the backup restore again to recreate the tables with correct schema:

```bash
cat ~/Code/scratch/backup/backup-seals.sql |
  ks exec -n ctmd -i ctmd-db-5bc7c4787b-5s64b --
  psql -U ctmd-user -d postgres
```

**Result:** ProposalDetails and ProposalFunding were created with correct schema and populated with 665 rows each. However, this created duplicate data in other tables.

---

### Step 5: Complete Database Reset (Final Solution)

To eliminate duplicates and ensure clean data, performed a complete schema reset:

```bash
# Drop entire schema and recreate
ks exec -n ctmd ctmd-db-5bc7c4787b-5s64b -- psql -U ctmd-user -d postgres -c "
  DROP SCHEMA public CASCADE;
  CREATE SCHEMA public;
  GRANT ALL ON SCHEMA public TO \"ctmd-user\";
  GRANT ALL ON SCHEMA public TO public;"
```

---

### Step 6: Single Clean Restore

Performed a single, complete restore from scratch:

```bash
cat ~/Code/scratch/backup/backup-seals.sql |
  ks exec -n ctmd -i ctmd-db-5bc7c4787b-5s64b --
  psql -U ctmd-user -d postgres > ~/Code/scratch/restore-final.log 2>&1
```

---

### Step 7: Verification

Verified all tables had correct row counts with no duplicates:

```bash
ks exec -n ctmd ctmd-db-5bc7c4787b-5s64b -- psql -U ctmd-user -d postgres -c "
  SELECT 'Proposal' as table_name, COUNT(*) FROM \"Proposal\"
  UNION ALL SELECT 'Submitter', COUNT(*) FROM \"Submitter\"
  UNION ALL SELECT 'ProposalDetails', COUNT(*) FROM \"ProposalDetails\"
  UNION ALL SELECT 'ProposalFunding', COUNT(*) FROM \"ProposalFunding\"
  UNION ALL SELECT 'AssignProposal', COUNT(*) FROM \"AssignProposal\";"
```

**Result:**
```
   table_name    | count
-----------------+-------
 Proposal        |   665
 Submitter       |   665
 ProposalDetails |   665
 ProposalFunding |   665
 AssignProposal  |   665
```

Verified the join query for graphics worked correctly:

```bash
ks exec -n ctmd ctmd-db-5bc7c4787b-5s64b -- psql -U ctmd-user -d postgres -c "
  SELECT COUNT(*) FROM \"Proposal\" p
  INNER JOIN \"Submitter\" s ON p.\"ProposalID\" = s.\"ProposalID\"
  INNER JOIN \"ProposalDetails\" pd ON p.\"ProposalID\" = pd.\"ProposalID\"
  INNER JOIN \"ProposalFunding\" pf ON p.\"ProposalID\" = pf.\"ProposalID\"
  LEFT JOIN \"AssignProposal\" ap ON p.\"ProposalID\" = ap.\"ProposalID\"
  WHERE ap.\"assignToInstitution\" IS NOT NULL;"
```

**Result:** 500 proposals with institution assignments (correct for graphics display)

---

## Root Cause Analysis

The primary issue was **schema drift** between:
1. The production database schema (from which backups were taken)
2. The fresh deployment schema (created by the pipeline's CREATE_TABLES process)

This is a common problem in database migrations when:
- The application code evolves and adds/removes columns
- Backups are taken from different versions of the schema
- Fresh deployments use current code but restore old data

---

## Mitigation Strategy

### Immediate Fix
Complete schema drop and single clean restore ensures all tables are created with the correct schema from the backup file itself.

### Long-term Prevention

1. **Schema Version Control:**
   - Maintain explicit database migration scripts
   - Version the database schema in git
   - Use migration tools (Flyway, Liquibase, etc.) for schema changes

2. **Backup Strategy:**
   - Use `pg_dump` with custom format (`-Fc`) instead of plain text for better restore reliability
   - Include schema version metadata in backups
   - Test restores regularly in staging environments

3. **Deployment Configuration:**
   - When deploying to existing database: Set `CREATE_TABLES: "0"` in values.yaml
   - When deploying fresh: Set `CREATE_TABLES: "1"`
   - Document which setting should be used in each scenario

4. **Helm Configuration for Database Persistence:**
   ```yaml
   postgres:
     persistence:
       create: false  # Use existing PVC with data
       existingClaim: "ctmd-db-pvc"

   pipeline:
     env:
       CREATE_TABLES: "0"  # Don't recreate tables when data exists
   ```

---

## Scripts Created

### convert_copy_to_insert.py

**Location:** `/tmp/convert_copy_to_insert.py` (temporary, not used in final solution)

**Purpose:** Convert PostgreSQL COPY statements to INSERT statements to handle embedded newlines

**Status:** Created during troubleshooting but ultimately not used because the schema mismatch issue required a different approach (dropping tables and clean restore)

**Note:** This script could be useful in future scenarios where COPY data needs to be transformed, but it doesn't solve schema compatibility issues.

---

## Key Lessons Learned

1. **Schema compatibility must be verified** before attempting partial restores
2. **Multiple partial restores create duplicate data** - always prefer complete schema reset
3. **Test the restore process** before actual production deployment
4. **pg_dump plain text format has limitations** with embedded special characters and newlines
5. **Helm annotations (`helm.sh/resource-policy: keep`)** are critical for preserving PVCs across deployments

---

## Commands Reference

### Check table row counts:
```bash
ks exec -n ctmd <pod-name> -- psql -U ctmd-user -d postgres -c "\dt"
ks exec -n ctmd <pod-name> -- psql -U ctmd-user -d postgres -c "SELECT COUNT(*) FROM \"TableName\";"
```

### Complete database reset:
```bash
ks exec -n ctmd <pod-name> -- psql -U ctmd-user -d postgres -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO \"ctmd-user\"; GRANT ALL ON SCHEMA public TO public;"
```

### Restore from backup:
```bash
cat backup.sql | ks exec -n ctmd -i <pod-name> -- psql -U ctmd-user -d postgres
```

### Check for duplicates:
```bash
ks exec -n ctmd <pod-name> -- psql -U ctmd-user -d postgres -c "SELECT \"ProposalID\", COUNT(*) FROM \"Proposal\" GROUP BY \"ProposalID\" HAVING COUNT(*) > 1;"
```

---

## Conclusion

The database restore issues were successfully resolved through a complete schema reset followed by a single clean restore. The root cause was schema incompatibility between existing tables and the backup data. Future deployments should follow the documented configuration settings and backup best practices to avoid similar issues.
