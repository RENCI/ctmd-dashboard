import React, { useMemo, useState } from 'react'
import { Button, Fade, IconButton, Paper, Popper, Tooltip } from '@material-ui/core'
import { DownloadIcon } from '../Icons/Download'
import { useStore } from '../../contexts'
import { CSVLink } from 'react-csv'

export const StudiesDownloadForm = props => {
    const [popperAnchor, setPopperAnchor] = useState(null)
    const [open, setOpen] = useState(false)
    const [{ proposals }, ] = useStore()
    const [exportFields, setExportFields] = useState({
        proposals: true,
        studies: true,
    })
    const handleToggleExportFields = event => {
        const { field } = event.target.dataset
        if (!['studies', 'proposals'].includes(field)) {
            return
        }
        setExportFields({
            ...exportFields,
            [event.target.dataset.field]: event.target.checked,
        })
    }

    const reports = useMemo(() => {
        return proposals
            .filter(p => !!p.profile)
            .map(p => ({
                'Proposal ID': p.proposalID,
                'Short Title': p.shortTitle,
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

                // studies table columns
                'Short Title': p.shortTitle,
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
                'Funding Amount': p.fundingAmount,
                'Funding Period': p.fundingPeriod,
                
                // proposals table columns
                // 'COVID Study': p.covidStudy,
                // 'fundingStatusWhenApproved': p.fundingStatusWhenApproved,
                // 'Funding Status': p.fundingStatus,
                // 'Study Population': p.studyPopulation,
                // 'Phase': p.phase,
                // 'Funding Source': p.fundingSource,
                // 'Funding Insitute 1': p.fundingInstitute,
                // 'Funding Insitute 2': p.fundingInstitute2,
                // 'Funding Insitute 3': p.fundingInstitute3,
                // 'New Funding Source': p.newFundingSource,
                // 'Funding Source Confirmation': p.fundingSourceConfirmation,
                // 'Actual Funding Start Date': p.actualFundingStartDate,
                // 'Estimated Funding Start Date': p.estimatedFundingStartDate,
                // 'Actual Protocol Final Date': p.actualProtocolFinalDate,
                // 'Approval Release Diff': p.approvalReleaseDiff,
                // 'Initial Contact Date': p.firstContact,
                // 'Kick-off Meeting Date': p.kickOff,
                // 'Number of CTSA Program Hub Sites': p.numberCTSAprogHubSites,
                // 'Number of Sites': p.numberSites,
                // 'Recommend for Comprehensive Consultation': p.approvedForComprehensiveConsultation,
            }))
    }, [proposals])

    const handleClickOpen = event => {
        setPopperAnchor(event.currentTarget)
        setOpen(prev => !prev);
    }

    return (
        <div>
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
            >
                {
                    ({ TransitionProps }) => (
                        <Fade { ...TransitionProps } timeout={ 350 }>
                            <Paper>
                                <input
                                    type="checkbox"
                                    data-field="studies"
                                    checked={ exportFields.studies }
                                    onChange={ handleToggleExportFields }
                                />
                                <input
                                    type="checkbox"
                                    data-field="proposals"
                                    checked={ exportFields.proposals }
                                    onChange={ handleToggleExportFields }
                                />
                                <IconButton
                                    component={ CSVLink }
                                    data={ reports }
                                    separator=","
                                    filename="study-reports"
                                ><DownloadIcon /></IconButton>
                            </Paper>
                        </Fade>
                    )
                }
            </Popper>
        </div>
    )
}
