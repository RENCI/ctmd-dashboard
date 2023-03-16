import React, { Fragment, useMemo, useState } from 'react'
import {
  Button, Checkbox, Divider, Fade, FormControlLabel, FormGroup, Paper, Popper, Tooltip, Typography,
} from '@material-ui/core'
import { DownloadIcon } from '../Icons/Download'
import { useStore } from '../../contexts'
import { CSVLink } from 'react-csv'

//

const generalColumns = [
  { label: 'Proposal ID',                              key: 'proposalID' },
  { label: 'Short Title',                              key: 'shortTitle' },
]

const studyColumns = [
  { label: 'Network',                                  key: 'profile.network' },
  { label: 'Assigned TIC/RIC',                         key: 'assignToInstitution' },
  { label: 'Type',                                     key: 'profile.type' },
  { label: 'Has Linked Studies',                       key: 'profile.linkedStudies' },
  { label: 'Design',                                   key: 'profile.design' },
  { label: 'Study is Randomized',                      key: 'profile.isRandomized' },
  { label: 'Randomization Unit',                       key: 'profile.randomizationUnit' },
  { label: 'Randomization Feature',                    key: 'profile.randomizationFeature' },
  { label: 'Ascertainment',                            key: 'profile.ascertainment' },
  { label: 'Observations',                             key: 'profile.observations' },
  { label: 'Pilot Study',                              key: 'profile.isPilot' },
  { label: 'Is Registry?',                             key: 'profile.isRegistry' },
  { label: 'EHR Data Transfer',                        key: 'profile.ehrDataTransfer' },
  { label: 'EHR Data Transfer Option',                 key: 'profile.ehrDatatransferOption' },
  { label: 'Study Requires Consent',                   key: 'profile.isConsentRequired' },
  { label: 'Is EFIC',                                  key: 'profile.isEfic' },
  { label: 'IRB Type',                                 key: 'profile.irbType' },
  { label: 'Regulatory Classification',                key: 'profile.regulatoryClassification' },
  { label: 'ClinicalTrials.gov ID',                    key: 'profile.clinicalTrialsGovId' },
  { label: 'DSMB/DMC Required',                        key: 'profile.isDsmbDmcRequired' },
  { label: 'Initial ParticipatingSiteCount',           key: 'profile.initialParticipatingSiteCount' },
  { label: 'Enrollment Goal',                          key: 'profile.enrollmentGoal' },
  { label: 'Initial Projected Enrollment Duration',    key: 'profile.initialProjectedEnrollmentDuration' },
  { label: 'Lead PIs',                                 key: 'profile.leadPIs' },
  { label: 'Awardee Site Acronym',                     key: 'profile.awardeeSiteAcronym' },
  { label: 'Primary Funding Type',                     key: 'profile.primaryFundingType' },
  { label: 'Funded Primarily by Infrastructure',       key: 'profile.isFundedPrimarilyByInfrastructure' },
  { label: 'Was Previously Funded',                    key: 'profile.isPreviouslyFunded' },
  { label: 'Date Funding was Awarded',                 key: 'profile.fundingAwardDate' },
  { label: 'Phase',                                    key: 'phase' },
]

const proposalColumns = [
  { label: 'PI',                                       key: 'piName' },
  { label: 'Proposal Status',                          key: 'proposalStatus' },
  { label: 'Therapeutic Area',                         key: 'therapeuticArea' },
  { label: 'Submitting Institution',                   key: 'submitterInstitution' },
  { label: 'Assigned TIC/RIC',                         key: 'assignToInstitution' },
  { label: 'Funding Amount',                           key: 'fundingAmount' },
  { label: 'Funding Period',                           key: 'fundingPeriod' },
  { label: 'fundingStatusWhenApproved',                key: 'fundingStatusWhenApproved' },
  { label: 'Funding Status',                           key: 'fundingStatus' },
  { label: 'Funding Source',                           key: 'fundingSource' },
  { label: 'Funding Insitute 1',                       key: 'fundingInstitute' },
  { label: 'Funding Insitute 2',                       key: 'fundingInstitute2' },
  { label: 'Funding Insitute 3',                       key: 'fundingInstitute3' },
  { label: 'New Funding Source',                       key: 'newFundingSource' },
  { label: 'Funding Source Confirmation',              key: 'fundingSourceConfirmation' },
  { label: 'Actual Funding Start Date',                key: 'actualFundingStartDate' },
  { label: 'Estimated Funding Start Date',             key: 'estimatedFundingStartDate' },
  { label: 'Submission Date',                          key: 'dateSubmitted' },
  { label: 'PAT Review Date',                          key: 'meetingDate' },
  { label: 'Planned Grant Submission Date',            key: 'plannedGrantSubmissionDate' },
  { label: 'Actual Grant Submission Date',             key: 'actualGrantSubmissionDate' },
  { label: 'Grant Award Date',                         key: 'actualGrantAwardDate' },
  { label: 'Actual Protocol Final Date',               key: 'actualProtocolFinalDate' },
  { label: 'Initial Contact Date',                     key: 'firstContact' },
  { label: 'Kick-off Meeting Date',                    key: 'kickOff' },
  { label: 'Number of CTSA Program Hub Sites',         key: 'numberCTSAprogHubSites' },
  { label: 'Number of Sites',                          key: 'numberSites' },
  { label: 'Recommend for Comprehensive Consultation', key: 'approvedForComprehensiveConsultation' },
  { label: 'Approval Release Diff',                    key: 'approvalReleaseDiff' },
  { label: 'Study Population',                         key: 'studyPopulation' },
  { label: 'Phase',                                    key: 'phase' },
  { label: 'COVID Study',                              key: 'covidStudy' },
]

//

export const StudiesDownloadForm = props => {
  const [{ proposals }, ] = useStore()

  const [popperAnchor, setPopperAnchor] = useState(null)
  const [open, setOpen] = useState(false)

  const [exportFields, setExportFields] = useState({ proposals: true, studies: true })

  const handleToggleExportFields = field => event => {
    if (!['studies', 'proposals'].includes(field)) { return }
    setExportFields({
      ...exportFields,
      [field]: event.target.checked,
    })
  }

  const handleClickOpen = event => {
    setPopperAnchor(event.currentTarget)
    setOpen(prevOpen => !prevOpen)
  }

  const headers = useMemo(() => {
    let cols = [...generalColumns]
    if (exportFields.studies) {
      cols = [...cols, ...studyColumns]
    }
    if (exportFields.proposals) {
      cols = [...cols, ...proposalColumns]
    }
    return [...cols]
  }, [exportFields])

  console.log(headers)

  const reports = useMemo(() => {
    return proposals
      .filter(p => !!p.profile)
  }, [proposals])

  return (
    <Fragment>
      <Tooltip title="Download study reports" aria-label="Download study reports">
        <Button
          variant="outlined"
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
                <Typography
                  variant="h6"
                  style={{ padding: '0.5rem 1rem' }}
                >Select Export Fields</Typography>
                
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
                  headers={ headers }
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
