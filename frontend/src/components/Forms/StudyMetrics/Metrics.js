import React, { Fragment, useState, useEffect, useContext } from 'react'
import axios from 'axios'
import ReactDOM from 'react-dom'
import { makeStyles } from '@material-ui/styles'
import { KeyboardArrowLeft as LeftIcon, KeyboardArrowRight as RightIcon } from '@material-ui/icons'
import { ExpandMore as ExpandMoreIcon } from '@material-ui/icons'
import { Grid, Card, CardHeader, CardContent, CardActions, Divider, Button } from '@material-ui/core'
import { ApiContext } from '../../../contexts/ApiContext'
import { FlashMessageContext } from '../../../contexts/FlashMessageContext'
import Subheading from '../../Typography/Subheading'
import CharacteristicsForm from './Characterstics'
import LinkedStudiesForm from './LinkedStudies'
import ArchitectureForm from './Architecture'
import ParticipationForm from './Participation'
import FundingForm from './Funding'
export const MetricsFormContext = React.createContext({})

const useStyles = makeStyles(theme => ({
    navigation: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    formContainer: {
    },
    formControl: {
        width: '100%',
        marginBottom: `${ 4 * theme.spacing.unit }px`,
    },
    actions: {
        display: 'flex',
        justifyContent: 'flex-end',
    },
}))

const emptyFormValues = ({
    proposalID: null,
    // Characteristics
    network: '',
    primaryStudyType: '',
    tic: '',
    ric: '',
    collaborativeTic: '',
    collaborativeTicDetails: '',
    dcc: '',
    ccc: '',
    // Linked Data
    hasSuperStudy: false,
    superStudy: '',
    hasSubStudy: false,
    subStudy: '',
    studyDesign: '',
    // Architecture
    isRandomized: false,
    randomizationUnit: '',
    randomizationFeatures: [],
    ascertainment: '',
    phase: '',
    pilotOrDemo: false,
    usesRegistryData: false,
    usesEhrDataTransfer: false,
    ehrDataTransferType: '',
    isConsentRequired: false,
    efic: false,
    irbTypes: [],
    regulatoryClassifications: [],
    clinicalTrialsGovId: '',
    isDsmbDmcRequired: false,
    // Funding
    initialParticipatingSiteNumber: '',
    enrollmentGoal: '',
    initialProjectedEnrollmentDuration: '',
    leadPiNames: '',
    awardeeSiteAcronym: '',
    primaryFundingType: '',
    primarilyFundedByInfrastructure: '',
    fundingSource: '',
    fundingAwardDate: '',
    previousFunding: '',
})

const MetricsForm = props => {
    const { proposalID } = props
    const [values, setValues] = useState(emptyFormValues)
    const [currentSubformNumber, setCurrentSubformNumer] = useState(0)
    const [submitAllowed, setSubmitAllowed] = useState(false)
    const api = useContext(ApiContext)
    const addFlashMessage = useContext(FlashMessageContext)
    const classes = useStyles()
    
    useEffect(() => {
        setCurrentSubformNumer(0)
        setValues({ ...emptyFormValues, proposalID: proposalID })
    }, [props.proposalID])

    useEffect(() => {
        axios.get(api.studyMetrics, { params: { proposalID: props.proposalID } })
            .then(response => {
                const { data } = response
                setValues({
                    proposalID: data.ProposalID,
                    // Characteristics
                    network: data.network,
                    primaryStudyType: data.primaryStudyType,
                    tic: data.tic,
                    ric: data.ric,
                    collaborativeTic: data.collaborativeTIC,
                    collaborativeTicDetails: data.collaborativeTIC_roleExplain,
                    dcc: data.DCCinstitution,
                    ccc: data.CCCinstitution,
                    // Linked Data
                    hasSuperStudy: data.sub_ancillaryStudy,
                    superStudy: data.mainStudy,
                    hasSubStudy: data.sub_ancillaryStudy,
                    subStudy: data.sub_ancillaryStudyName,
                    studyDesign: data.studyDesign,
                    // Architecture
                    isRandomized: data.randomized,
                    randomizationUnit: data.randomizationUnit,
                    randomizationFeatures: JSON.parse(data.randomizationFeature),
                    ascertainment: data.ascertainment,
                    isPilotOrDemo: data.pilot_demoStudy,
                    phase: data.phase,
                    usesRegistryData: data.registry,
                    usesEhrDataTransfer: data.EHRdataTransfer,
                    ehrDataTransferType: data.EHRdataTransfer_option,
                    isConsentRequired: data.consent,
                    efic: data.EFIC,
                    irbTypes: JSON.parse(data.IRBtype),
                    regulatoryClassifications: JSON.parse(data.regulatoryClassification),
                    clinicalTrialsGovId: data.clinicalTrialsIdentifier,
                    isDsmbDmcRequired: data.dsmb_dmcUsed,
                    // Funding
                    initialParticipatingSiteNumber: data.initialPlannedNumberOfSites,
                    enrollmentGoal: data.enrollmentGoal,
                    initialProjectedEnrollmentDuration: data.initialProjectedEnrollmentDuration,
                    leadPiNames: null,
                    awardeeSiteAcronym: null,
                    primaryFundingType: null,
                    primarilyFundedByInfrastructure: null,
                    fundingSource: null,
                    fundingAwardDate: null,
                    previousFunding: null,
                })
            })
            .catch(error => console.log('Error', error))
    }, [props.proposalID])

    useEffect(() => {
        setSubmitAllowed(true)
    }, [values])

    const handleNavigate = value => event => {
        setCurrentSubformNumer((currentSubformNumber + value + subforms.length) % subforms.length)
    }
    
    const handleSave = () => {
        axios.post(api.studyMetrics, values)
            .then(response => {
                addFlashMessage('Form Submitted!')
                setSubmitAllowed(false)
            })
            .catch(error => console.log('Error', error))
    }

    const subforms = [
        { title: 'Study Characteristics', form: <CharacteristicsForm classes={ classes } /> },
        { title: 'Linked Studies', form: <LinkedStudiesForm classes={ classes } /> },
        { title: 'Study Architecture', form: <ArchitectureForm classes={ classes } /> },
        { title: 'Participation', form: <ParticipationForm classes={ classes } /> },
        { title: 'Study Funding', form: <FundingForm classes={ classes } /> },
    ]
    
    const formNavigation = (
        <Fragment>
            <Button disabled={ currentSubformNumber === 0 } color="secondary" onClick={ handleNavigate(-1) }>
                <LeftIcon />
                { currentSubformNumber > 0 ? subforms[currentSubformNumber - 1].title : null }
            </Button>
            <div className="flexer"/>
            <Button disabled={ currentSubformNumber === subforms.length - 1 } color="secondary" onClick={ handleNavigate(1) }>
                { currentSubformNumber + 1 < subforms.length ? subforms[currentSubformNumber + 1].title : null }
                <RightIcon />
            </Button>
        </Fragment>
    )

    return (
        <MetricsFormContext.Provider value={ [values, setValues] }>
            <div style={{ width: '100%' }}>
                <CardActions className={ classes.navigation }>
                    { formNavigation }
                </CardActions>
                <CardHeader style={{textAlign: 'center' }} title={ subforms[currentSubformNumber].title } />
                <CardContent className={ classes.formContainer }>
                    { subforms[currentSubformNumber].form }
                </CardContent>
                <CardActions className={ classes.navigation }>
                    { formNavigation }
                </CardActions>
                <Divider />
                <CardActions className={ classes.actions }>
                    <Button color="primary" disabled={ !submitAllowed } onClick={ handleSave }>
                        { submitAllowed ? 'Save' : 'Saved!' }
                    </Button>
                </CardActions>
            </div>
        </MetricsFormContext.Provider>
    )
}

export default MetricsForm