"""
Downloads proposal records from the REDCap API using filterLogic batching.

Batches records by proposal_id range (matching the old pipeline approach) to avoid
using the `records[]` parameter which requires REDCap's internal record ID, not
the proposal_id field value.

Only the 149 targeted fields derived from mapping.json are requested per batch,
reducing API response size and network overhead vs. downloading all 8,000+ fields.

Configuration (environment variables):
  REDCAP_URL_BASE           REDCap API endpoint URL
  REDCAP_APPLICATION_TOKEN  API token
  REDCAP_BATCH_SIZE         Records per API request (default: 10)
"""

import json
import logging
import os

import requests

from redcap_importer.mapping import get_redcap_fields

logger = logging.getLogger(__name__)

_HEADERS = {
    "Content-Type": "application/x-www-form-urlencoded",
    "Accept": "application/json",
}

_BASE_PARAMS = [
    ("content", "record"),
    ("format", "json"),
    ("type", "flat"),
    ("rawOrLabel", "raw"),
    ("rawOrLabelHeaders", "raw"),
    ("exportCheckboxLabel", "false"),
    ("exportSurveyFields", "false"),
    ("exportDataAccessGroups", "false"),
    ("returnFormat", "json"),
]


class RedcapDownloader:
    def __init__(self, mapping_path: str):
        self.url = os.environ["REDCAP_URL_BASE"]
        self.token = os.environ["REDCAP_APPLICATION_TOKEN"]
        self.batch_size = int(os.environ.get("REDCAP_BATCH_SIZE", 10))

        # Load the targeted field list from mapping.json (spec: download only 149 fields)
        fields = get_redcap_fields(mapping_path)
        # Ensure proposal_id is always included (needed for all operations)
        if "proposal_id" not in fields:
            fields = sorted(["proposal_id"] + fields)

        # Validate against REDCap data dictionary — some mapping.json entries reference
        # computed/derived field names that don't exist as actual REDCap fields.
        valid_fields = self._fetch_valid_field_names()
        if valid_fields:
            original_count = len(fields)
            fields = [f for f in fields if f in valid_fields]
            dropped = original_count - len(fields)
            if dropped:
                logger.warning(
                    "Dropped %d field(s) not in REDCap data dictionary: %s",
                    dropped,
                    sorted(set(get_redcap_fields(mapping_path)) - valid_fields),
                )

        self._field_params = [(f"fields[{i}]", f) for i, f in enumerate(fields)]
        logger.info(
            "RedcapDownloader initialised — batch size %d, targeted fields: %d",
            self.batch_size,
            len(fields),
        )

    def _fetch_valid_field_names(self) -> set:
        """Downloads the REDCap data dictionary and returns the set of valid field names."""
        try:
            resp = requests.post(
                self.url,
                data=[
                    ("token", self.token),
                    ("content", "metadata"),
                    ("format", "json"),
                    ("returnFormat", "json"),
                ],
                headers=_HEADERS,
                timeout=60,
            )
            resp.raise_for_status()
            return {entry["field_name"] for entry in resp.json()}
        except Exception:
            logger.warning("Could not fetch REDCap data dictionary for field validation; using full field list")
            return set()

    def _post(self, extra_params: list) -> list:
        data = [("token", self.token)] + _BASE_PARAMS + extra_params
        response = requests.post(self.url, data=data, headers=_HEADERS, timeout=60)
        response.raise_for_status()
        return response.json()

    def get_proposal_ids(self) -> list[str]:
        """Fetches only proposal_id for every record — lightweight first pass."""
        logger.info("Fetching all proposal IDs")
        records = self._post([("fields[0]", "proposal_id")])
        ids = sorted(
            [r["proposal_id"] for r in records if r.get("proposal_id")],
            key=lambda x: int(x),
        )
        logger.info("Found %d proposals", len(ids))
        return ids

    def _fetch_batch(self, proposal_ids: list[str]) -> list[dict]:
        """Fetches a batch of records using filterLogic on proposal_id range."""
        min_id = proposal_ids[0]
        max_id = proposal_ids[-1]
        extra = self._field_params + [
            ("filterLogic", f"[proposal_id]>={min_id} && [proposal_id]<={max_id}"),
        ]
        return self._post(extra)

    def download_all(self) -> list[dict]:
        """
        Returns all proposal records. Fetches in batches using filterLogic on
        proposal_id ranges (sorted ascending) to stay within REDCap API limits.
        """
        all_ids = self.get_proposal_ids()
        batches = [
            all_ids[i:i + self.batch_size]
            for i in range(0, len(all_ids), self.batch_size)
        ]

        records = []
        for batch_num, batch in enumerate(batches, start=1):
            logger.info("Fetching batch %d/%d (proposal_id %s–%s)",
                        batch_num, len(batches), batch[0], batch[-1])
            records.extend(self._fetch_batch(batch))

        logger.info("Downloaded %d total records", len(records))
        return records

    def download_to_file(self, output_path: str):
        """Downloads all records and writes them to a JSON file."""
        records = self.download_all()
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(records, f)
        logger.info("Wrote %d records to %s", len(records), output_path)
