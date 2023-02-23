import React, { useMemo } from 'react'
import { Button, Tooltip } from '@material-ui/core'
import { DownloadIcon } from '../Icons/Download'
import { useStore } from '../../contexts'
import { CSVLink } from 'react-csv'

export const StudiesDownloadForm = props => {
    const [{ proposals }, ] = useStore()

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
            }))
    }, [proposals])

    return (
        <Tooltip title="Download study reports" aria-label="Download study reports">
            <Button
                component={ CSVLink }
                variant="outlined"
                data={ reports }
                separator=","
                filename="study-reports"
                startIcon={ <DownloadIcon /> }
            >Study Reports</Button>
        </Tooltip>
    )
}
