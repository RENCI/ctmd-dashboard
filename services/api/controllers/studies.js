const db = require("../config/database");
const stringToInteger = require("./utils").stringToInteger;
const fs = require("fs");
const csv = require("csv-parser");
const lookupFieldName = require("../config/dictionary");

// NIH enrollment-demographics cells: ethnicity x sex (4) + race x sex (10) = 14.
// Planned cells live on StudyProfile (per study); actual cells live on StudySites
// (per site) and are summed to the study (CTMD-198/199/200).
const DEMO_STEMS = [
  "HispanicFemale", "HispanicMale", "NonHispanicFemale", "NonHispanicMale",
  "AIANFemale", "AIANMale", "AsianFemale", "AsianMale", "NHPIFemale", "NHPIMale",
  "BlackFemale", "BlackMale", "WhiteFemale", "WhiteMale",
];
const PLANNED_COLS = DEMO_STEMS.map((s) => `planned${s}`);
const ACTUAL_COLS = DEMO_STEMS.map((s) => `actual${s}`);

// /api/studies/:id

exports.getProfile = (req, res) => {
  const proposalId = req.params.id;
  const query = `SELECT 
                "StudyProfile".*,
                "PhaseOfStudy"."PhaseMapped",
                "actualGrantAwardDate" as "Date Funding was Awarded",
                  case 
                    when t.description like '%TIC%' then t.description
                    else null
                  end as "tic",
                  case 
                    when t.description like '%RIC%' then t.description
                    else null
                  end as "ric"
                  FROM "StudyProfile"
                  left join (select "name".description, ap."ProposalID" 
                    from "AssignProposal" ap 
                    join "name" on ap."assignToInstitution" = "name"."index" 
                    where "name"."table" = 'AssignProposal') as t on t."ProposalID" = "StudyProfile"."ProposalID" 
                  left join (select "PhaseOfStudy", "ProposalID", "description" as "PhaseMapped"
                        from "Proposal" 
                        join "name" on "name"."index" = "Proposal"."PhaseOfStudy" 
                        where "name"."column" = 'PhaseOfStudy') as "PhaseOfStudy" on "PhaseOfStudy"."ProposalID" = "StudyProfile"."ProposalID" 
                  left join "ProtocolTimelines_estimated" on "ProtocolTimelines_estimated"."ProposalID" = "StudyProfile"."ProposalID" 
                  WHERE "StudyProfile"."ProposalID" = ${proposalId};`;
  db.any(query)
    .then((data) => {
      const profile = data[0];

      /* We have to delete a key here because it is in the database but we don't want to use it.
               We then have to rename the key from the other table as the deleted key because the keys show up as they come in.
               Once phase is deleted from the table StudyProfile we can remove the delete and rename logic
            */
      delete profile["phase"];
      delete profile["fundingAwardDate"];
      delete Object.assign(profile, { ["phase"]: profile["PhaseMapped"] })[
        "PhaseMapped"
      ];

      Object.keys(profile).forEach((key) => {
        profile[key] = {
          value: profile[key],
          displayName: lookupFieldName(key),
        };
      });
      res.status(200).send(profile);
    })
    .catch((error) => {
      console.log("ERROR:", error);
      res.status(500).send("There was an error fetching data.");
    });
};

// /api/studies/studysites

exports.getStudySites = (req, res) => {

  const query = `SELECT
            "StudySites"."dataElement",
            "StudySites"."lostToFollowUp",
            "StudySites"."ProposalID",
            "StudySites"."siteId",
            "CTSAs"."ctsaId",
            "StudySites"."siteId",
            "StudySites"."siteName",
            "StudySites"."siteNumber",
            "CTSAs"."ctsaId",
            "CTSAs"."ctsaName",
            "StudySites"."principalInvestigator",
            CAST("StudySites"."dateRegPacketSent" as VARCHAR),
            CAST("StudySites"."dateContractSent" as VARCHAR),
            CAST("StudySites"."dateIrbSubmission" as VARCHAR),
            CAST("StudySites"."dateIrbApproval" as VARCHAR),
            CAST("StudySites"."dateContractExecution" as VARCHAR),
            CAST("StudySites"."lpfv" as VARCHAR),
            CAST("StudySites"."dateSiteActivated" as VARCHAR),
            CAST("StudySites"."fpfv" as VARCHAR),
            "StudySites"."patientsConsentedCount",
            "StudySites"."patientsEnrolledCount",
            "StudySites"."patientsWithdrawnCount",
            "StudySites"."patientsExpectedCount",
            "StudySites"."queriesCount",
            "StudySites"."protocolDeviationsCount"
        FROM "StudySites"
        LEFT JOIN "Sites" ON "StudySites"."siteId" = "Sites"."siteId"
        LEFT JOIN "CTSAs" ON "StudySites"."ctsaId" = "CTSAs"."ctsaId"
        `;
  db.any(query)
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((error) => {
      console.log("ERROR:", error);
      res.status(500).send("There was an error fetching data.");
    });
};


// /api/studies/:id/sites

exports.getSites = (req, res) => {
    const proposalId = req.params.id;
    const query = `SELECT
            "StudySites"."dataElement",
            "StudySites"."lostToFollowUp",
            "StudySites"."ProposalID",
            "StudySites"."siteId",
            "CTSAs"."ctsaId",
            "StudySites"."siteId",
            "StudySites"."siteName",
            "StudySites"."siteNumber",
            "CTSAs"."ctsaId",
            "CTSAs"."ctsaName",
            "StudySites"."principalInvestigator",
            CAST("StudySites"."dateRegPacketSent" as VARCHAR),
            CAST("StudySites"."dateContractSent" as VARCHAR),
            CAST("StudySites"."dateIrbSubmission" as VARCHAR),
            CAST("StudySites"."dateIrbApproval" as VARCHAR),
            CAST("StudySites"."dateContractExecution" as VARCHAR),
            CAST("StudySites"."lpfv" as VARCHAR),
            CAST("StudySites"."dateSiteActivated" as VARCHAR),
            CAST("StudySites"."fpfv" as VARCHAR),
            "StudySites"."patientsConsentedCount",
            "StudySites"."patientsEnrolledCount",
            "StudySites"."patientsWithdrawnCount",
            "StudySites"."patientsExpectedCount",
            "StudySites"."queriesCount",
            "StudySites"."protocolDeviationsCount",
            ${ACTUAL_COLS.map((c) => `"StudySites"."${c}"`).join(",\n            ")}
        FROM "StudySites"
        LEFT JOIN "Sites" ON "StudySites"."siteId" = "Sites"."siteId"
        LEFT JOIN "CTSAs" ON "StudySites"."ctsaId" = "CTSAs"."ctsaId"
        WHERE "ProposalID"=${proposalId};`;
    db.any(query)
        .then((data) => {
            res.status(200).send(data);
        })
        .catch((error) => {
            console.log("ERROR:", error);
            res.status(500).send("There was an error fetching data.");
        });
};


// /api/studies/:id/enrollment-data

exports.getEnrollmentData = (req, res) => {
  const proposalId = req.params.id;
  const query = `SELECT
            "ProposalID",
            "date",
            "revisedProjectedSites",
            "actualSites",
            "actualEnrollment",
            "targetEnrollment"
        FROM "EnrollmentInformation" WHERE "ProposalID" = ${proposalId};`;
  db.any(query)
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((error) => {
      console.log("ERROR:", error);
      res.status(500).send("There was an error fetching data.");
    });
};

// /studies/:id/demographics
// Per-study enrollment demographics in the NIH structure (planned + actual,
// ethnicity x sex + race x sex). Planned (target) cells are read from StudyProfile
// (one row per study); actual cells are SUMMED across the study's StudySites rows.
// The response keeps the old EnrollmentDemographics column names, so the frontend
// is unchanged. Returns a single-element array, or [] when the study has neither
// planned nor actual demographics. (CTMD-198/199/200)
exports.getDemographics = (req, res) => {
  const proposalId = req.params.id;
  const plannedSelect = PLANNED_COLS.map((c) => `sp."${c}"`).join(", ");
  const actualSelect = ACTUAL_COLS.map((c) => `COALESCE(agg."${c}", 0) AS "${c}"`).join(", ");
  const actualAgg = ACTUAL_COLS.map((c) => `SUM("${c}") AS "${c}"`).join(", ");
  // $1 (the ProposalID) is parameterized; the route constrains :id to \d+.
  const query = `
    SELECT base.pid AS "ProposalID", ${plannedSelect}, ${actualSelect}
    FROM (SELECT $1::bigint AS pid) base
    LEFT JOIN "StudyProfile" sp ON sp."ProposalID" = base.pid
    LEFT JOIN (
      SELECT "ProposalID", ${actualAgg}
      FROM "StudySites"
      WHERE "ProposalID" = $1
      GROUP BY "ProposalID"
    ) agg ON agg."ProposalID" = base.pid;`;
  db.any(query, [proposalId])
    .then((data) => {
      const row = data[0] || {};
      const hasPlanned = PLANNED_COLS.some((c) => row[c] !== null && row[c] !== undefined);
      const hasActual = ACTUAL_COLS.some((c) => Number(row[c]) > 0);
      res.status(200).send(hasPlanned || hasActual ? [row] : []);
    })
    .catch((error) => {
      console.log("ERROR:", error);
      res.status(500).send("There was an error fetching data.");
    });
};
