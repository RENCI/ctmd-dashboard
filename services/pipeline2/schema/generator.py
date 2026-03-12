"""
Reads mapping.json once and emits CREATE TABLE SQL for all CTMD tables.

Run this script to regenerate the migration file:
    python -m schema.generator > migrations/001_initial_schema.sql

The output is committed to git as a static migration. The pipeline applies
it at startup via the migration runner — mapping.json is not parsed at runtime.
"""

import json
import sys
from collections import defaultdict


# PostgreSQL type mapping for Data Type values in mapping.json.
# 'text ' (trailing space) is a data quality issue in 8 entries — normalize it.
# Use BIGINT for int to avoid 32-bit overflow on large proposal IDs.
_TYPE_MAP = {
    "text": "VARCHAR",
    "text ": "VARCHAR",
    "int": "BIGINT",
    "float": "DOUBLE PRECISION",
    "boolean": "BOOLEAN",
    "date": "DATE",
}


def load_mapping(mapping_path: str) -> list[dict]:
    with open(mapping_path, encoding="utf-8") as f:
        return json.load(f)


def _pg_type(data_type: str) -> str:
    normalized = data_type.strip().lower()
    return _TYPE_MAP.get(normalized, "VARCHAR")


def generate_sql(mapping_path: str) -> str:
    """
    Returns a SQL string with CREATE TABLE IF NOT EXISTS statements for
    every table defined in mapping.json.
    """
    entries = load_mapping(mapping_path)

    # Group entries by table, preserving insertion order
    tables: dict[str, list[dict]] = defaultdict(list)
    for entry in entries:
        table = entry.get("Table_CTMD", "").strip()
        if table:
            tables[table].append(entry)

    lines = [
        "-- Auto-generated from mapping.json. Do not edit by hand.",
        "-- Regenerate with: python -m schema.generator > migrations/001_initial_schema.sql",
        "",
    ]

    for table, fields in tables.items():
        pk_cols = [
            f["Fieldname_CTMD"].strip()
            for f in fields
            if f.get("Primary", "").strip().lower() == "yes"
        ]

        col_lines = []
        for field in fields:
            col = field.get("Fieldname_CTMD", "").strip()
            if not col:
                continue
            pg_type = _pg_type(field.get("Data Type", ""))
            col_lines.append(f'    "{col}" {pg_type}')

        if pk_cols:
            pk_expr = ", ".join(f'"{c}"' for c in pk_cols)
            col_lines.append(f"    PRIMARY KEY ({pk_expr})")

        col_block = ",\n".join(col_lines)
        lines.append(f'CREATE TABLE IF NOT EXISTS "{table}" (')
        lines.append(col_block)
        lines.append(");")
        lines.append("")

    # Append auxiliary tables that are generated from the REDCap data dictionary
    # (not from record data) and therefore don't appear in mapping.json.
    lines += [
        "-- Auxiliary tables (generated from REDCap data dictionary, not mapping.json)",
        'CREATE TABLE IF NOT EXISTS "name" (',
        '    "table" VARCHAR,',
        '    "column" VARCHAR,',
        '    "index" VARCHAR,',
        '    "id" VARCHAR,',
        '    "description" VARCHAR',
        ");",
        "",
        'CREATE TABLE IF NOT EXISTS "reviewer_organization" (',
        '    "reviewer" VARCHAR,',
        '    "organization" VARCHAR',
        ");",
        "",
    ]

    return "\n".join(lines)


if __name__ == "__main__":
    mapping_path = sys.argv[1] if len(sys.argv) > 1 else "data/mapping.json"
    print(generate_sql(mapping_path))
