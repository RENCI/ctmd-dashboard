"""
Generates the `name` lookup table from the REDCap data dictionary.

The `name` table maps CTMD table/column combinations to human-readable
descriptions of their coded values (dropdown, radio, and checkbox options).
It is used by the Node.js API to resolve option codes to labels.

The data comes from the REDCap data dictionary (field metadata), downloaded
via the REDCap API `content=metadata` endpoint — separate from the record data.

Example row:
  (table="Submitter", column="submitterInstitution",
   index="63", id="org_name___63", description="Boston University")
"""

import logging
import os
import re

import requests

logger = logging.getLogger(__name__)

_HEADERS = {
    "Content-Type": "application/x-www-form-urlencoded",
    "Accept": "application/json",
}


def _download_data_dictionary(url: str, token: str) -> list[dict]:
    """Downloads the REDCap data dictionary (field metadata) via the API."""
    data = {
        "token": token,
        "content": "metadata",
        "format": "json",
        "returnFormat": "json",
    }
    response = requests.post(url, data=data, headers=_HEADERS, timeout=60)
    response.raise_for_status()
    return response.json()


def _parse_choices(choices_str: str) -> list[tuple[str, str]]:
    """
    Parses REDCap's pipe-delimited choice string into (code, label) tuples.

    Format: "code1, label1 | code2, label2 | ..."
    The label may contain commas, so we only split on the first comma per segment.
    """
    if not choices_str or not choices_str.strip():
        return []

    results = []
    for segment in choices_str.split("|"):
        segment = segment.strip()
        if not segment:
            continue
        # Split on first comma only
        parts = segment.split(",", 1)
        if len(parts) == 2:
            code = parts[0].strip()
            label = parts[1].strip()
            results.append((code, label))
    return results


def _base_field_name(expr: str) -> str | None:
    """
    Extracts the base REDCap field name from a mapping expression.
    Returns None for n/a, generate_ID, or non-field expressions.

    Examples:
      "org_name"              → "org_name"
      "ric_poc_v2_2/ric_poc_2" → "ric_poc_v2_2"  (first alternative)
      "extract_first_name(pi_name/pi_name_2)" → None  (function, not a direct field)
      "generate_ID(pi_firstname,pi_lastname)" → None
      "consult_options___1"   → "consult_options"
      'if ko_meeting="1" then kick_off_scheduled else "N/A"' → "ko_meeting"  (condition field)
    """
    expr = expr.strip()
    if not expr or expr == "n/a":
        return None
    # Skip generate_ID and extract_* functions (not simple field lookups)
    if re.match(r"^\w+\(", expr):
        return None
    # Conditional expressions — extract the field being tested in the condition
    # Pattern: if field_name="value" then ... else ...
    if expr.startswith("if "):
        m = re.match(r'^if\s+(\w+)\s*=', expr)
        if m:
            return m.group(1)
        return None
    # Take first alternative before /
    first = expr.split("/")[0].strip()
    # Strip checkbox suffix (___N)
    base = re.sub(r"___\d+$", "", first)
    return base if base else None


def generate_name_table(mapping_entries: list[dict]) -> list[dict]:
    """
    Downloads the REDCap data dictionary and generates rows for the `name` table.

    Args:
        mapping_entries: The parsed mapping.json (list of dicts).

    Returns:
        List of dicts with keys: table, column, index, id, description.
    """
    url = os.environ["REDCAP_URL_BASE"]
    token = os.environ["REDCAP_APPLICATION_TOKEN"]

    logger.info("Downloading REDCap data dictionary for name table generation")
    try:
        data_dict = _download_data_dictionary(url, token)
    except Exception:
        logger.exception("Failed to download data dictionary; name table will be empty")
        return []

    logger.info("Downloaded data dictionary: %d field definitions", len(data_dict))

    # Build index: field_name → field metadata
    field_meta = {entry["field_name"]: entry for entry in data_dict}

    # Build index: base_redcap_field → list of (ctmd_table, ctmd_column)
    # Use first mapping entry per (table, column) combination.
    field_to_ctmd: dict[str, list[tuple[str, str]]] = {}
    seen_table_col: set[tuple[str, str]] = set()

    for entry in mapping_entries:
        table = entry.get("Table_CTMD", "").strip()
        column = entry.get("Fieldname_CTMD", "").strip()
        expr = entry.get("Fieldname_redcap", "").strip()

        if not table or not column or not expr:
            continue
        if (table, column) in seen_table_col:
            continue

        base = _base_field_name(expr)
        if not base:
            continue

        seen_table_col.add((table, column))
        field_to_ctmd.setdefault(base, []).append((table, column))

    # Generate name table rows
    rows = []
    generated_keys: set[tuple] = set()  # avoid duplicates

    for base_field, ctmd_targets in field_to_ctmd.items():
        meta = field_meta.get(base_field)
        if not meta:
            continue

        field_type = meta.get("field_type", "")
        choices_str = meta.get("select_choices_or_calculations", "")

        if field_type not in ("dropdown", "radio", "checkbox") or not choices_str:
            continue

        choices = _parse_choices(choices_str)
        if not choices:
            continue

        for table, column in ctmd_targets:
            for code, label in choices:
                row_id = f"{base_field}___{code}"
                key = (table, column, code)
                if key in generated_keys:
                    continue
                generated_keys.add(key)
                rows.append({
                    "table": table,
                    "column": column,
                    "index": code,
                    "id": row_id,
                    "description": label,
                })

    logger.info("Generated %d name table rows", len(rows))
    return rows
