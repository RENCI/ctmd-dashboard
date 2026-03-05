import json
import logging
import sys
import requests
import pprint

logger = logging.getLogger(__name__)


class RedCapDownloader:
    def __init__(self):
        self.url = "https://redcap.vumc.org/api/"
        self.token = "NOT_SET"


    def get_all_record_ids(self) -> list[str]:
        logger.info("Fetching all record IDs from %s", self.url)
        res = []
        data = {
            "token": self.token,
            "content": "record",
            'action': 'export',
            "format": "json",
            "type": "flat",
            "rawOrLabel": "raw",
            "rawOrLabelHeaders": "raw",
            "exportCheckboxLabel": "false",
            "exportSurveyFields": "false",
            "exportDataAccessGroups": "false",
            "returnFormat": "json",
            'fields[0]': 'proposal_id',
        }
        headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json",
        }

        response = requests.post(self.url, data=data, headers=headers)
        response.raise_for_status()
        logger.debug("Response status: %d", response.status_code)

        for record in response.json():
            res.append(record["proposal_id"])

        logger.info("Fetched %d record IDs", len(res))
        return res

    def get_record_by_id(self, record_id: str):
        fields = [
            "proposal_id",
            "actual_date",
            "grant_re_submission_date",
            "add_service_post_outcome",
            "amount_award",
            "anticipated_budget",
            "app_services_pat_outcome",
            "bo_submission",
            "cfs_2",
            "city_list",
            "conso_or_services",
            "consult_options",
            "covid",
            "discussed1",
            "discussed2",
            "discussed3",
            "discussed4",
            "discussed5",
            "discussed6",
            "discussed7",
            "dl_sent2",
            "pi_name",
            "pi_name_2",
            "fund_assessmemt",
            "funding",
            "funding_duration",
            "fund_duration",
            "funding_mechanism",
            "funding_mechanism_2",
            "funding_mechanism_3",
            "funding_nih",
            "funding_opp_announcement",
            "funding_other",
            "funding_other_2",
            "funding_other_3",
            "funding_source_4",
            "funding_source_5",
            "funding_source",
            "funding_source_2",
            "funding_source_3",
            "fwa",
            "pi_firstname",
            "pi_lastname",
            "grant_app_no",
            "grant_sub_deadline",
            "header_8b",
            "header_8d",
            "header_8e",
            "header_8f",
            "heal_study",
            "institute_center",
            "institute_center_2",
            "institute_center_3",
            "intro_call",
            "issues",
            "meeting_date",
            "meeting_date_2",
            "more_than_500000",
            "ncats_poc_2",
            "ncats_poc_3",
            "ncats_poc_v2_2",
            "ncats_poc_v2_3",
            "new_funding_source",
            "new_service_selection",
            "nih_funding",
            "non_us_sites",
            "notes4",
            "number_csta_sites",
            "number_sites",
            "number_subjects",
            "objectives",
            "org_name",
            "other_comments",
            "other_funding_4",
            "other_funding_5",
            "other_funding",
            "other_funding_2",
            "other_funding_3",
            "other_organization",
            "partnership",
            "pat_funds_diff",
            "phone_number",
            "pi",
            "pi_firstname",
            "pi_lastname",
            "planned_submission_date",
            "po_name",
            "pro_time_date_4",
            "pro_time_date_5",
            "site_active_date",
            "project_budget1",
            "project_budget5",
            "project_budget6",
            "project_funding_date",
            "projected_funding_date",
            "prop_submit",
            "prop_summary_describe2_054",
            "prop_summary_describe2_110",
            "prop_summary_describe2_35c",
            "prop_summary_describe2_42d",
            "prop_summary_describe2_5f5",
            "prop_summary_describe2_a3f",
            "prop_summary_describe2_b32",
            "prop_summary_describe2_b45",
            "proposal_title2",
            "protocol_final_start",
            "protocol_status",
            "rare_disease",
            "recommendations",
            "recommendations1",
            "recommendations2",
            "release_of_funds_2",
            "removed_services",
            "revewed_in_consult",
            "review",
            "review_discuss",
            "ric_poc_v2_2",
            "ric_poc_2",
            "satisfaction_sent",
            "scientific_review",
            "service_recommended",
            "services_approved",
            "short_name",
            "sources_1",
            "staff_status",
            "study_description",
            "study_design_initial",
            "study_duration_comments2",
            "study_population",
            "study_vumc_ric1ase",
            "submitters_contact_email",
            "summary_of_recomendatio",
            "theraputic_area",
            "tic_budget_changes",
            "tic_poc_v2_2",
            "tic_poc_2",
            "tic_ric_assign_v2",
            "tic_ric_assign",
            "updated_funding_status",
            "vote_comments",
            "vote_comments_2",
            "wk_complete",
            "wrap_up_sent"]

        logger.info("Fetching record %s", record_id)
        data = {
            "token": self.token,
            "content": "record",
            'action': 'export',
            "format": "json",
            "type": "flat",
            "rawOrLabel": "raw",
            "rawOrLabelHeaders": "raw",
            "exportCheckboxLabel": "false",
            "exportSurveyFields": "false",
            "exportDataAccessGroups": "false",
            "returnFormat": "json",
            "records[0]": record_id,
        }

        i = 0
        for field in fields:
            data["fields[" + str(i) + "]"] = field
            i += 1

        headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json",
        }

        response = requests.post(self.url, data=data, headers=headers)
        response.raise_for_status()
        logger.debug("Response status: %d", response.status_code)
        return response.json()


    def download_all_records_to_file(self, path: str):
        logger.info("Downloading all records to %s", path)
        all_ids = self.get_all_record_ids()

        records = []
        for record_id in all_ids:
            logger.info("Downloading record %s", record_id)
            r = self.get_record_by_id(record_id)
            records.append(r)

        with open(path, "w") as outfile:
            logger.info("Writing records to %s", path)
            json.dump(records, outfile)





