import json
import logging
import os
import requests

def getLogger(name):
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)
    handler = logging.StreamHandler()
    formatter = logging.Formatter("%(asctime)s;%(levelname)s;%(message)s", "%Y-%m-%d %H:%M:%S")
    logger.addHandler(handler)
    logger.propagate = False
    handler.setFormatter(formatter)
    return logger


class RedcapExport:
    def __init__(self, token: str, url: str):
        self.token = token
        self.url = url
        self.batch_size = os.environ.get("BATCH_SIZE") or 10

    HEADERS: dict = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
    }

    DATA: dict = {
        "content": "record",
        "format": "json",
        "type": "flat",
        "rawOrLabel": "raw",
        "rawOrLabelHeaders": "raw",
        "exportCheckboxLabel": "false",
        "exportSurveyFields": "false",
        "exportDataAccessGroups": "false",
        "returnFormat": "json",
    }

    def get_proposal_ids(self) -> list:
        proposal_ids = requests.post(
            self.url,
            data={
                **self.DATA,
                "fields": "proposal_id",
                "token": self.token,
            },
            headers=self.HEADERS,
            stream=False,
        )
        return self.__sort_proposals(proposal_ids.json())

    def __sort_proposals(self, proposals):
        sorted_proposals = sorted(proposals, key=lambda k: int(k["proposal_id"]))
        return sorted_proposals

    def iterate_over_batch(self, gte_proposal_id: str, lte_proposal_id: str) -> requests.Response:
        r = requests.post(
            self.url,
            data={
                **self.DATA,
                "filterLogic": f"[proposal_id]>={gte_proposal_id} && [proposal_id]<={lte_proposal_id}",
                "token": self.token,
            },
            headers=self.HEADERS,
            stream=False,
        )
        return r

    def chunk_proposals(self, proposals: list) -> list:
        return [proposals[x : x + self.batch_size] for x in range(0, len(proposals), self.batch_size)]

    def get_proposals(self, proposals: list) -> list:
        merged_proposals = []
        for chunk in proposals:
            res = self.iterate_over_batch(chunk[0]["proposal_id"], chunk[-1]["proposal_id"])
            if res.status_code != 200:
                # Consider raising an exception
                logger.info("Request failed to get Redcap data")
            else:
                merged_proposals.append(res.json())
        flat_list = [item for sublist in merged_proposals for item in sublist]
        return flat_list

    def write_to_file(self, data, output):
        with open(output, "w") as outfile:
            json.dump(data, outfile)
