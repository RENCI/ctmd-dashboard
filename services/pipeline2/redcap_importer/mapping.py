"""
Parses mapping.json to derive the set of REDCap field names required for the ETL.

mapping.json is the authoritative source for which REDCap fields are needed.
Each entry maps a REDCap field expression to a CTMD database column. Field
expressions can take several forms that need to be unpacked to raw field names:

  - Simple:      "proposal_id"
  - Slash-alt:   "funding_source/funding_source_2/funding_source_3"
  - Function:    "extract_first_name(pi_name/pi_name_2)"
  - Conditional: "if ko_meeting="1" then kick_off_scheduled else "N/A""
  - Ignored:     "n/a"  (column is populated from CSV upload, not REDCap)
"""

import json
import re


def load(mapping_path: str) -> list[dict]:
    with open(mapping_path, encoding="utf-8") as f:
        return json.load(f)


def get_redcap_fields(mapping_path: str) -> list[str]:
    """
    Returns a sorted, deduplicated list of raw REDCap field names derived
    from all entries in mapping.json whose Fieldname_redcap is not 'n/a'.
    """
    entries = load(mapping_path)
    fields = set()

    for entry in entries:
        expr = entry.get("Fieldname_redcap", "").strip()

        if not expr or expr == "n/a":
            continue

        fields.update(_parse_expression(expr))

    return sorted(fields)


def _parse_expression(expr: str) -> set[str]:
    """
    Extracts raw REDCap field names from a mapping expression.

    Handles:
      - Function wrappers:  extract_first_name(pi_name/pi_name_2)
      - Slash alternatives: funding_source/funding_source_2/funding_source_3
      - Conditionals:       if ko_meeting="1" then kick_off_scheduled else "N/A"
      - Simple fields:      proposal_id
    """
    # Function wrapper: word( ... ) — extract inner content, split on / or ,
    func_match = re.match(r'^\w+\(([^)]+)\)$', expr)
    if func_match:
        inner = func_match.group(1)
        return {f.strip() for f in re.split(r'[/,]', inner) if f.strip()}

    # Conditional expression — extract bare snake_case identifiers
    if expr.startswith("if "):
        _KEYWORDS = {"if", "then", "else", "and", "or", "not"}
        return {
            m for m in re.findall(r'\b([a-z][a-z0-9_]+)\b', expr)
            if len(m) > 2 and m not in _KEYWORDS
        }

    # Slash-separated alternatives — parse each part individually in case
    # a conditional expression appears as a suffix (e.g. "field/if x then y")
    fields = set()
    for part in expr.split("/"):
        part = part.strip()
        if not part:
            continue
        if part.startswith("if "):
            fields.update(_parse_expression(part))
        else:
            fields.add(part)
    return fields
