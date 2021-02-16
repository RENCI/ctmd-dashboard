const db = require("../config/database");
const stringToInteger = require("./utils").stringToInteger;
const fs = require("fs");
const csv = require("csv-parser");
const lookupFieldName = require("../config/dictionary");

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
                    left join (select "PhaseOfStudy", "ProposalID" from "Proposal") as "PhaseOfStudy" on "PhaseOfStudy"."ProposalID" = "StudyProfile"."ProposalID" 
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
      delete Object.assign(profile, { ["phase"]: profile["PhaseOfStudy"] })[
        "PhaseOfStudy"
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
            "CTSAs"."ctsaId",
            "CTSAs"."ctsaName",
            "StudySites"."principalInvestigator",
            "StudySites"."dateRegPacketSent",
            "StudySites"."dateContractSent",
            "StudySites"."dateIrbSubmission",
            "StudySites"."dateIrbApproval",
            "StudySites"."dateContractExecution",
            "StudySites"."lpfv",
            "StudySites"."dateSiteActivated",
            "StudySites"."fpfv",
            "StudySites"."patientsConsentedCount",
            "StudySites"."patientsEnrolledCount",
            "StudySites"."patientsWithdrawnCount",
            "StudySites"."patientsExpectedCount",
            "StudySites"."queriesCount",
            "StudySites"."protocolDeviationsCount"
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
