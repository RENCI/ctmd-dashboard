"""
Downloads proposal records from the REDCap API, requesting only the fields
derived from mapping.json rather than the full export.

Configuration (environment variables):
  REDCAP_URL_BASE           REDCap API endpoint URL
  REDCAP_APPLICATION_TOKEN  API token
  REDCAP_BATCH_SIZE         Records per API request (default: 50)
"""

import json
import logging
import os

import requests

from .mapping import get_redcap_fields

logger = logging.getLogger(__name__)

_HEADERS = {
    "Content-Type": "application/x-www-form-urlencoded",
    "Accept": "application/json",
}

_BASE_PARAMS = {
    "content": "record",
    "action": "export",
    "format": "json",
    "type": "flat",
    "rawOrLabel": "raw",
    "rawOrLabelHeaders": "raw",
    "exportCheckboxLabel": "false",
    "exportSurveyFields": "false",
    "exportDataAccessGroups": "false",
    "returnFormat": "json",
}


class RedcapDownloader:
    def __init__(self, mapping_path: str):
        self.url = os.environ["REDCAP_URL_BASE"]
        self.token = os.environ["REDCAP_APPLICATION_TOKEN"]
        self.batch_size = int(os.environ.get("REDCAP_BATCH_SIZE", 50))
        self.fields = get_redcap_fields(mapping_path)
        logger.info("RedcapDownloader initialised — %d fields, batch size %d",
                    len(self.fields), self.batch_size)

    def _post(self, params: dict) -> list:
        params["token"] = self.token
        response = requests.post(self.url, data=params, headers=_HEADERS, timeout=60)
        response.raise_for_status()
        return response.json()

    def get_proposal_ids(self) -> list[str]:
        """Fetches only proposal_id for every record — lightweight first pass."""
        logger.info("Fetching all proposal IDs")
        params = {**_BASE_PARAMS, "fields[0]": "proposal_id"}
        records = self._post(params)
        ids = [r["proposal_id"] for r in records if r.get("proposal_id")]
        logger.info("Found %d proposals", len(ids))
        return ids

    def _fetch_batch(self, proposal_ids: list[str]) -> list[dict]:
        """Fetches a single batch of records, filtered to the mapped field list."""
        params = {**_BASE_PARAMS}

        for i, pid in enumerate(proposal_ids):
            params[f"records[{i}]"] = pid

        for i, field in enumerate(self.fields):
            params[f"fields[{i}]"] = field

        return self._post(params)

    def download_all(self) -> list[dict]:
        """
        Returns all proposal records containing only the fields in mapping.json.
        Fetches in batches to stay within REDCap API limits.
        """
        all_ids = self.get_proposal_ids()
        batches = [
            all_ids[i:i + self.batch_size]
            for i in range(0, len(all_ids), self.batch_size)
        ]

        records = []
        for batch_num, batch in enumerate(batches, start=1):
            logger.info("Fetching batch %d/%d (%d records)",
                        batch_num, len(batches), len(batch))
            records.extend(self._fetch_batch(batch))

        logger.info("Downloaded %d total records", len(records))
        return records

    def download_to_file(self, output_path: str):
        """Downloads all records and writes them to a JSON file."""
        records = self.download_all()
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(records, f)
        logger.info("Wrote %d records to %s", len(records), output_path)
