import React, { Fragment, useMemo, useState } from 'react'
import {
  Button, Checkbox, Divider, Fade, FormControlLabel, FormGroup, Paper, Popper, Tooltip, Typography,
} from '@material-ui/core'
import { DownloadIcon } from '../Icons/Download'
import { useStore } from '../../contexts'
import { CSVLink } from 'react-csv'

export const StudiesDownloadForm = props => {
  const [{ proposals }, ] = useStore()

  const [popperAnchor, setPopperAnchor] = useState(null)
  const [open, setOpen] = useState(false)

  const [exportFields, setExportFields] = useState({
    proposals: true,
    studies: true,
  })

  const handleToggleExportFields = field => event => {
    if (!['studies', 'proposals'].includes(field)) {
      return
    }
    setExportFields({
      ...exportFields,
      [field]: event.target.checked,
    })
  }

  const handleClickOpen = event => {
    setPopperAnchor(event.currentTarget)
    setOpen(prev => !prev);
  }

  const reports = useMemo(() => {
    return proposals
      .filter(p => !!p.profile)
      .map(p => {
        let ret = {
          'Proposal ID': p.proposalID,
          'Short Title': p.shortTitle,
        }
        if (exportFields.studies) {
          ret = {
            ...ret,
            'Network': p.profile.network,
            'Assigned TIC/RIC': p.assignToInstitution,
            'Type': p.profile.type,
            'Has Linked Studies': p.profile.linkedStudies,
            'Design': p.profile.design,
            'Study is Randomized': p.profile.isRandomized,
            'Randomization Unit': p.profile.randomizationUnit,
            'Randomization Feature': p.profile.randomizationFeature,
            'Ascertainment': p.profile.ascertainment,
            'Observations': p.profile.observations,
            'Pilot Study': p.profile.isPilot,
            'Is Registry?': p.profile.isRegistry,
            'EHR Data Transfer': p.profile.ehrDataTransfer,
            'EHR Data Transfer Option': p.profile.ehrDatatransferOption,
            'Study Requires Consent': p.profile.isConsentRequired,
            'Is EFIC': p.profile.isEfic,
            'IRB Type': p.profile.irbType,
            'Regulatory Classification': p.profile.regulatoryClassification,
            'ClinicalTrials.gov ID': p.profile.clinicalTrialsGovId,
            'DSMB/DMC Required': p.profile.isDsmbDmcRequired,
            'Initial ParticipatingSiteCount': p.profile.initialParticipatingSiteCount,
            'Enrollment Goal': p.profile.enrollmentGoal,
            'Initial Projected Enrollment Duration': p.profile.initialProjectedEnrollmentDuration,
            'Lead PIs': p.profile.leadPIs,
            'Awardee Site Acronym': p.profile.awardeeSiteAcronym,
            'Primary Funding Type': p.profile.primaryFundingType,
            'Funded Primarily by Infrastructure': p.profile.isFundedPrimarilyByInfrastructure,
            'Was Previously Funded': p.profile.isPreviouslyFunded,
            'Date Funding was Awarded': p.profile.fundingAwardDate,
            'Phase': p.phase,
          }
        }
        if (exportFields.proposals) {
          ret = {
            ...ret,
            //  general
            'PI': p.piName,
            'Proposal Status': p.proposalStatus,
            'Therapeutic Area': p.therapeuticArea,
            'Submitting Institution': p.submitterInstitution,
            'Assigned TIC/RIC': p.assignToInstitution,
            'Submission Date': p.dateSubmitted,
            'PAT Review Date': p.meetingDate,
            'Planned Grant Submission Date': p.plannedGrantSubmissionDate,
            'Actual Grant Submission Date': p.actualGrantSubmissionDate,
            'Grant Award Date': p.actualGrantAwardDate,
            // funding
            'Funding Amount': p.fundingAmount,
            'Funding Period': p.fundingPeriod,
            'fundingStatusWhenApproved': p.fundingStatusWhenApproved,
            'Funding Status': p.fundingStatus,
            'Funding Source': p.fundingSource,
            'Funding Insitute 1': p.fundingInstitute,
            'Funding Insitute 2': p.fundingInstitute2,
            'Funding Insitute 3': p.fundingInstitute3,
            'New Funding Source': p.newFundingSource,
            'Funding Source Confirmation': p.fundingSourceConfirmation,
            'Actual Funding Start Date': p.actualFundingStartDate,
            'Estimated Funding Start Date': p.estimatedFundingStartDate,
            // dates
            'Actual Protocol Final Date': p.actualProtocolFinalDate,
            'Approval Release Diff': p.approvalReleaseDiff,
            'Initial Contact Date': p.firstContact,
            'Kick-off Meeting Date': p.kickOff,
            // sites
            'Number of CTSA Program Hub Sites': p.numberCTSAprogHubSites,
            'Number of Sites': p.numberSites,
            // consult
            'Recommend for Comprehensive Consultation': p.approvedForComprehensiveConsultation,
            //
            'Study Population': p.studyPopulation,
            'Phase': p.phase,
            'COVID Study': p.covidStudy,
          }
        }
        return ret
      })
  }, [exportFields, proposals])

  return (
    <Fragment>
      <Tooltip title="Download study reports" aria-label="Download study reports">
        <Button
          variant="outlined"
          data={ reports }
          separator=","
          filename="study-reports"
          startIcon={ <DownloadIcon /> }
          onClick={ handleClickOpen }
        >Study Reports</Button>
      </Tooltip>
      <Popper
        open={ open }
        anchorEl={ popperAnchor }
        placement="bottom"
        transition
        style={{ zIndex: 99 }}
      >
        {
          ({ TransitionProps }) => (
            <Fade { ...TransitionProps } timeout={ 350 }>
              <Paper style={{
                width: '200px',
                display: 'flex',
                flexDirection: 'column',
              }}>
                <Typography variant="h6" style={{ padding: '0.5rem 1rem' }}>Select Export Fields</Typography>
                
                <Divider />
                
                <FormGroup style={{ padding: '0.5rem 1rem' }}>
                  <FormControlLabel
                    label="Studies Fields"
                    control={
                      <Checkbox
                        checked={ exportFields.studies }
                        onChange={ handleToggleExportFields('studies') }
                      />
                    }
                  />
                  <FormControlLabel
                    label="Proposals Fields"
                    control={
                      <Checkbox
                        checked={ exportFields.proposals }
                        onChange={ handleToggleExportFields('proposals') }
                      />
                    }
                  />
                </FormGroup>
                
                <Divider />
                
                <Button
                  component={ CSVLink }
                  data={ reports }
                  separator=","
                  filename="study-reports"
                >Download</Button>
              </Paper>
            </Fade>
          )
        }
      </Popper>
    </Fragment>
  )
}
