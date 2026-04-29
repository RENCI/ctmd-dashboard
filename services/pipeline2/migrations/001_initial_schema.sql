-- Auto-generated from mapping.json. Do not edit by hand.
-- Regenerate with: python -m schema.generator > migrations/001_initial_schema.sql

CREATE TABLE IF NOT EXISTS "StudyPI" (
    "AreYouStudyPI" BOOLEAN,
    "userId" BIGINT
);

CREATE TABLE IF NOT EXISTS "CTSA" (
    "CTSAhubPIFirstName" VARCHAR,
    "CTSAhubPILastName" VARCHAR,
    "ProposalID" BIGINT,
    "approvalfromCTSA" BOOLEAN
);

CREATE TABLE IF NOT EXISTS "ProposalDetails" (
    "ProposalID" BIGINT,
    "therapeuticArea" VARCHAR,
    "rareDisease" BOOLEAN,
    "numberSubjects" BIGINT,
    "numberSites" BIGINT,
    "numberNonUSsites" BIGINT,
    "listCountries" VARCHAR,
    "numberCTSAprogHubSites" BIGINT,
    "notableRisk" VARCHAR
);

CREATE TABLE IF NOT EXISTS "Submitter" (
    "userId" VARCHAR,
    "ProposalID" BIGINT,
    "submitterFirstName" VARCHAR,
    "submitterLastName" VARCHAR,
    "submitterFacultyStatus" BIGINT,
    "submitterEmail" VARCHAR,
    "submitterPhone" VARCHAR,
    "submitterInstitution" VARCHAR,
    "submitterInstitutionOther" VARCHAR,
    PRIMARY KEY ("userId", "ProposalID")
);

CREATE TABLE IF NOT EXISTS "ProtocolTimelines_estimated" (
    "ProposalID" BIGINT,
    "plannedFinalProtocol" DATE,
    "plannedFirstSiteActivated" DATE,
    "plannedSubmissionDate" DATE,
    "grantSubDeadline" DATE,
    "plannedGrantSubmissionDate" DATE,
    "actualGrantSubmissionDate" DATE,
    "plannedGrantAwardDate" DATE,
    "actualGrantAwardDate" DATE,
    "estimatedStartDateOfFunding" DATE,
    "actualProtocolFinalDate" DATE,
    "approvalReleaseDiff" BIGINT
);

CREATE TABLE IF NOT EXISTS "Proposal" (
    "ProposalID" BIGINT,
    "dateSubmitted" DATE,
    "proposalStatus" VARCHAR,
    "HEALnetwork" BOOLEAN,
    "covidStudy" BOOLEAN,
    "ShareThisInfo" BOOLEAN,
    "FullTitle" VARCHAR,
    "ShortTitle" VARCHAR,
    "PhaseOfStudy" VARCHAR,
    "ShortDescription" VARCHAR,
    "ProtocolDesign" VARCHAR,
    "Objectives" VARCHAR,
    "Endpoints" VARCHAR,
    "StudyPopulation" VARCHAR,
    "MainEntryCriteria" VARCHAR,
    "PlannedSitesEnrollingParticipants" VARCHAR,
    "DescriptionOfStudyIntervention" VARCHAR,
    "StudyDuration" VARCHAR,
    "ParticipantDuration" VARCHAR,
    "DisclosureConflicts" VARCHAR,
    "optStatisticalPlan" VARCHAR,
    "optEnrollmentPlan" VARCHAR
);

CREATE TABLE IF NOT EXISTS "ProposalFunding" (
    "newFundingSource" VARCHAR,
    "ProposalID" BIGINT,
    "submittedToNIH" BOOLEAN,
    "currentFunding" VARCHAR,
    "newFundingStatus" VARCHAR,
    "numberFundingSource" BIGINT,
    "fundingSource" VARCHAR,
    "fundingSourceOther" VARCHAR,
    "fundingSource2" VARCHAR,
    "fundingSourceOther2" VARCHAR,
    "fundingSource3" VARCHAR,
    "fundingSourceOther3" VARCHAR,
    "fundingMechanism" VARCHAR,
    "fundingMechanismOther" VARCHAR,
    "fundingMechanism2" VARCHAR,
    "fundingMechanismOther2" VARCHAR,
    "fundingMechanism3" VARCHAR,
    "fundingMechanismOther3" VARCHAR,
    "instituteCenter" VARCHAR,
    "instituteCenter2" VARCHAR,
    "instituteCenter3" VARCHAR,
    "grantApplicationNumber" VARCHAR,
    "FOAnumber" VARCHAR,
    "planningGrant" BOOLEAN,
    "largerThan500K" BOOLEAN,
    "amountAward" VARCHAR,
    "totalBudget" VARCHAR,
    "totalBudgetInt" DOUBLE PRECISION,
    "fundingPeriod" VARCHAR,
    "fundingStart" DATE,
    "applicationToInstituteBusinessOfficeDate" DATE,
    "discussWithPO" BOOLEAN,
    "POsName" VARCHAR,
    "NewOrExistingNetwork" BOOLEAN,
    "peerReviewDone" VARCHAR,
    "fundingSourceConfirmation" VARCHAR
);

CREATE TABLE IF NOT EXISTS "User" (
    "userId" VARCHAR,
    "password" VARCHAR,
    "loginStatus" VARCHAR,
    "registerDate" DATE,
    PRIMARY KEY ("userId")
);

CREATE TABLE IF NOT EXISTS "Administrator" (
    "userId" VARCHAR,
    "adminName" VARCHAR,
    "adminEmail" VARCHAR
);

CREATE TABLE IF NOT EXISTS "TINuser" (
    "userId" VARCHAR,
    "TINuser_fname" VARCHAR,
    "TINuser_lname" VARCHAR,
    "TINuser_email" VARCHAR,
    "TINuserOrganization" VARCHAR,
    PRIMARY KEY ("userId")
);

CREATE TABLE IF NOT EXISTS "AssignProposal" (
    "ProposalID" BIGINT,
    "assignToInstitution" VARCHAR,
    "ticPOC" VARCHAR,
    "ricPOC" VARCHAR,
    "ncatsPOC" VARCHAR
);

CREATE TABLE IF NOT EXISTS "TIChealPOCs" (
    "ProposalID" BIGINT,
    "DukePOC" VARCHAR,
    "UtahPOC" VARCHAR,
    "jhuPOC" VARCHAR
);

CREATE TABLE IF NOT EXISTS "InitialConsultationDates" (
    "ProposalID" BIGINT,
    "FirstContact" DATE,
    "kickOffNeeded" BOOLEAN,
    "kickOffScheduled" DATE,
    "kickOffDateOccurs" DATE,
    "workComplete" DATE,
    "reportSentToPI" DATE
);

CREATE TABLE IF NOT EXISTS "ConsultationRequest" (
    "consultationRequestID" BIGINT,
    "ProposalID" BIGINT,
    "serviceOrComprehensive" VARCHAR,
    PRIMARY KEY ("consultationRequestID")
);

CREATE TABLE IF NOT EXISTS "Proposal_ConsultOptions" (
    "ProposalID" BIGINT,
    "consultOptions" VARCHAR,
    PRIMARY KEY ("ProposalID", "consultOptions")
);

CREATE TABLE IF NOT EXISTS "ServicesAdditionalInfo" (
    "consultationRequestID" BIGINT,
    "SAuseBefore" BOOLEAN,
    "CIRBfwaNumber" VARCHAR
);

CREATE TABLE IF NOT EXISTS "InitialConsultationSummary" (
    "ProposalID" BIGINT,
    "protocolReviewed" BOOLEAN,
    "budgetReviewed" BOOLEAN,
    "fundingReviewed" BOOLEAN,
    "CIRBdiscussed" BOOLEAN,
    "SAdiscussed" BOOLEAN,
    "EHRdiscussed" BOOLEAN,
    "CommunityEngagementDiscuss" BOOLEAN,
    "RecruitmentPlanDiscussed" BOOLEAN,
    "recruitmentMaterialsDiscussed" BOOLEAN,
    "FeasibilityAssessmentDiscussed" BOOLEAN,
    "OtherComments" VARCHAR
);

CREATE TABLE IF NOT EXISTS "LettersAndSurvey" (
    "ProposalID" BIGINT,
    "decisionLetterSent" DATE,
    "satisfactionSurveySent" DATE,
    "LetterOfSupport" DATE
);

CREATE TABLE IF NOT EXISTS "PATMeeting" (
    "ProposalID" BIGINT,
    "meetingDate" DATE,
    "meetingNumber" BIGINT,
    "comments" VARCHAR
);

CREATE TABLE IF NOT EXISTS "Voter" (
    "userId" VARCHAR,
    "ProposalID" BIGINT,
    "Role" VARCHAR
);

CREATE TABLE IF NOT EXISTS "PATReviewForVote" (
    "ProposalID" BIGINT,
    "requireVote" BOOLEAN,
    "vote" VARCHAR
);

CREATE TABLE IF NOT EXISTS "BudgetBreakOut" (
    "ProposalID" BIGINT,
    "siteBudget" VARCHAR,
    "recruitmentBudget" VARCHAR,
    "overallBudget" VARCHAR,
    "budgetNotes" VARCHAR
);

CREATE TABLE IF NOT EXISTS "RecommendationsForPI" (
    "ProposalID" BIGINT,
    "protocolRecommendation" VARCHAR,
    "budgetRecommendation" BOOLEAN,
    "fundingAssessment" VARCHAR,
    "CIRBrecommendation" VARCHAR,
    "SArecommendation" VARCHAR
);

CREATE TABLE IF NOT EXISTS "TIC_RICAssessment" (
    "ProposalID" BIGINT,
    "Issues" VARCHAR,
    "BudgetFeasible" VARCHAR,
    "TICcapacity" BOOLEAN,
    "undertakeAtCurrentState" VARCHAR,
    "opportunityToCollaborate" VARCHAR,
    "operationHypothesis" VARCHAR
);

CREATE TABLE IF NOT EXISTS "FinalRecommendation" (
    "ProposalID" BIGINT,
    "recommendation" VARCHAR,
    "serviceRecommended" VARCHAR
);

CREATE TABLE IF NOT EXISTS "SiteInformation" (
    "ProposalID" BIGINT,
    "siteNumber" VARCHAR,
    "siteName" VARCHAR,
    "principalInvestigator" VARCHAR,
    "studyCoordinator" VARCHAR,
    "ctsaName" VARCHAR,
    "ctsaPOC" VARCHAR,
    "activeProtocolDate" DATE,
    "protocolVersion" VARCHAR,
    "patientsExpectedCount" BIGINT,
    "dateIrbApproval" DATE,
    "CTA_FE" DATE,
    "enrollmentStatus" VARCHAR,
    "onHoldDate" DATE,
    "onHoldDays" BIGINT,
    "dateSiteActivated" DATE,
    "dateOfFirstConsent" DATE,
    "fpfv" DATE,
    "mostRecentConsent" DATE,
    "lpfv" DATE,
    "patientsConsentedCount" BIGINT,
    "patientsEnrolledCount" BIGINT,
    "patientEnrollmentRate" DOUBLE PRECISION,
    "noOfPtsActive_site" BIGINT,
    "noOfPtsComplete_site" BIGINT,
    "patientsWithdrawnCount" BIGINT,
    "noOfCRFsCompleted_site" BIGINT,
    "percentCRFsReviewed_site" DOUBLE PRECISION,
    "percentCRFsIncomplete_site" DOUBLE PRECISION,
    "queriesCount" BIGINT,
    "noOfSAEs_site" BIGINT,
    "protocolDeviationsCount" BIGINT,
    "CTAsentdate" DATE,
    "dateRegPacketSent" DATE,
    "siteSelectDate" DATE,
    "notesToSite" VARCHAR,
    "dateContractSent" DATE,
    "dateIrbSubmission" DATE,
    "dateContractExecution" DATE,
    PRIMARY KEY ("ProposalID", "siteNumber")
);

CREATE TABLE IF NOT EXISTS "StudyInformation" (
    "ProposalID" BIGINT,
    "studyStartDate" DATE,
    "plannedCompleteEnrollment" DATE,
    "noOfSitesActive" BIGINT,
    "noOfPtsEnrolled" BIGINT,
    "noOfPtsActive" BIGINT,
    "noOfPtsComplete" BIGINT,
    "noOfPtsWithdrawn" BIGINT,
    "noOfCRFsEnteredForStudy" BIGINT,
    "percentCRFsReviewed" DOUBLE PRECISION,
    "percentCRFsIncomplete" DOUBLE PRECISION,
    "noOfUnresolvedQueries" BIGINT,
    "noOfSignificantProtocolDeviations" BIGINT,
    "noOfSAEs" BIGINT,
    "mostRecentPatientEnrolled" DATE
);

CREATE TABLE IF NOT EXISTS "SuggestedChanges" (
    "changeID" BIGINT,
    "ShortTitle" VARCHAR,
    "plannedDateToChange" DATE,
    "changeComplete" BOOLEAN,
    PRIMARY KEY ("changeID")
);

CREATE TABLE IF NOT EXISTS "UtahRecommendation" (
    "ProposalID" BIGINT,
    "network" VARCHAR,
    "tic" VARCHAR,
    "ric" VARCHAR,
    "collaborativeTIC" VARCHAR,
    "collaborativeTIC_roleExplain" VARCHAR,
    "DCCinstitution" VARCHAR,
    "CCCinstitution" VARCHAR,
    "primaryStudyType" VARCHAR,
    "sub_ancillaryStudy" BOOLEAN,
    "mainStudy" VARCHAR,
    "hasSubAncillaryStudy" BOOLEAN,
    "sub_ancillaryStudyName" VARCHAR,
    "linkedData" VARCHAR,
    "studyDesign" VARCHAR,
    "randomized" BOOLEAN,
    "randomizationUnit" VARCHAR,
    "randomizationFeature" VARCHAR,
    "ascertainment" VARCHAR,
    "observations" VARCHAR,
    "pilot_demoStudy" BOOLEAN,
    "pilot_or_demo" VARCHAR,
    "registry" BOOLEAN,
    "EHRdataTransfer" BOOLEAN,
    "EHRdataTransfer_option" VARCHAR,
    "consent" BOOLEAN,
    "EFIC" BOOLEAN,
    "IRBtype" VARCHAR,
    "regulatoryClassification" VARCHAR,
    "clinicalTrialsIdentifier" VARCHAR,
    "dsmb_dmcUsed" BOOLEAN,
    "initialPlannedNumberOfSites" BIGINT,
    "finalPlannedNumberOfSites" BIGINT,
    "enrollmentGoal" VARCHAR,
    "initialProjectedEnrollmentDuration" BIGINT,
    "actualEnrollment" BIGINT
);

CREATE TABLE IF NOT EXISTS "Proposal_NewServiceSelection" (
    "ProposalID" BIGINT,
    "serviceSelection" VARCHAR
);

CREATE TABLE IF NOT EXISTS "Proposal_ServicesApproved" (
    "ProposalID" BIGINT,
    "servicesApproved" VARCHAR
);

CREATE TABLE IF NOT EXISTS "Proposal_ServicesPatOutcome" (
    "ProposalID" BIGINT,
    "servicesPatOutcome" VARCHAR
);

CREATE TABLE IF NOT EXISTS "Proposal_ServicesPostOutcome" (
    "ProposalID" BIGINT,
    "servicesPostOutcome" VARCHAR
);

CREATE TABLE IF NOT EXISTS "Proposal_RemovedServices" (
    "ProposalID" BIGINT,
    "removedServices" VARCHAR
);

CREATE TABLE IF NOT EXISTS "EnrollmentInformation" (
    "ProposalID" BIGINT,
    "enrollmentMonth" VARCHAR,
    "date" DATE,
    "revisedProjectedSites" BIGINT,
    "projectedSites" BIGINT,
    "targetEnrollment" BIGINT,
    "actualSites" BIGINT,
    "actualEnrollment" BIGINT,
    "activationSurplusDeficit" BIGINT,
    "enrollmentSurplusDeficit" BIGINT
);

CREATE TABLE IF NOT EXISTS "Sites" (
    "siteId" BIGINT,
    "ctsaId" BIGINT,
    "siteName" VARCHAR,
    PRIMARY KEY ("siteId")
);

CREATE TABLE IF NOT EXISTS "StudySites" (
    "dataElement" DOUBLE PRECISION,
    "lostToFollowUp" BIGINT,
    "ProposalID" BIGINT,
    "principalInvestigator" VARCHAR,
    "siteNumber" VARCHAR,
    "siteId" BIGINT,
    "ctsaId" BIGINT,
    "siteName" VARCHAR,
    "dateRegPacketSent" DATE,
    "dateContractSent" DATE,
    "dateIrbSubmission" DATE,
    "dateIrbApproval" DATE,
    "dateContractExecution" DATE,
    "lpfv" DATE,
    "dateSiteActivated" DATE,
    "fpfv" DATE,
    "patientsConsentedCount" BIGINT,
    "patientsEnrolledCount" BIGINT,
    "patientsWithdrawnCount" BIGINT,
    "patientsExpectedCount" BIGINT,
    "queriesCount" BIGINT,
    "protocolDeviationsCount" BIGINT
);

CREATE TABLE IF NOT EXISTS "CTSAs" (
    "ctsaId" BIGINT,
    "ctsaName" VARCHAR,
    PRIMARY KEY ("ctsaId")
);

CREATE TABLE IF NOT EXISTS "StudyProfile" (
    "ProposalID" BIGINT,
    "network" VARCHAR,
    "tic" VARCHAR,
    "ric" VARCHAR,
    "type" VARCHAR,
    "linkedStudies" VARCHAR,
    "design" VARCHAR,
    "isRandomized" BOOLEAN,
    "randomizationUnit" VARCHAR,
    "randomizationFeature" VARCHAR,
    "ascertainment" VARCHAR,
    "observations" VARCHAR,
    "isPilot" BOOLEAN,
    "phase" VARCHAR,
    "isRegistry" BOOLEAN,
    "ehrDataTransfer" BOOLEAN,
    "ehrDatatransferOption" VARCHAR,
    "isConsentRequired" BOOLEAN,
    "isEfic" BOOLEAN,
    "irbType" VARCHAR,
    "regulatoryClassification" VARCHAR,
    "clinicalTrialsGovId" VARCHAR,
    "isDsmbDmcRequired" BOOLEAN,
    "initialParticipatingSiteCount" BIGINT,
    "enrollmentGoal" VARCHAR,
    "initialProjectedEnrollmentDuration" BIGINT,
    "leadPIs" VARCHAR,
    "awardeeSiteAcronym" VARCHAR,
    "primaryFundingType" VARCHAR,
    "isFundedPrimarilyByInfrastructure" BOOLEAN,
    "fundingAwardDate" DATE,
    "isPreviouslyFunded" BOOLEAN,
    "contractType" VARCHAR,
    "fieldsPerCasebook" BIGINT,
    "comments" VARCHAR,
    "projectStatus" VARCHAR,
    "dateLastUpdated" DATE
);

-- Auxiliary tables (generated from REDCap data dictionary, not mapping.json)
CREATE TABLE IF NOT EXISTS "name" (
    "table" VARCHAR,
    "column" VARCHAR,
    "index" VARCHAR,
    "id" VARCHAR,
    "description" VARCHAR
);

CREATE TABLE IF NOT EXISTS "reviewer_organization" (
    "reviewer" VARCHAR,
    "organization" VARCHAR
);

