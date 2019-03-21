import React, { Fragment, useState, useEffect, useContext } from 'react'
import axios from 'axios'
import ReactDOM from 'react-dom'
import { makeStyles } from '@material-ui/styles'
import { KeyboardArrowLeft as LeftIcon, KeyboardArrowRight as RightIcon } from '@material-ui/icons'
import { ExpandMore as ExpandMoreIcon } from '@material-ui/icons'
import { Grid, Card, CardHeader, CardContent, CardActions, Divider, Button } from '@material-ui/core'
import { ApiContext } from '../../../contexts/ApiContext'
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
    hasSuperStudy: '',
    superStudy: '',
    hasSubStudy: '',
    subStudy: '',
    studyDesign: '',
    // Architecture
    isRandomized: '',
    randomizationUnit: '',
    randomizationFeatures: [],
    ascertainment: '',
    phase: '',
    pilotOrDemo: '', //
    usesRegistryData: '',
    usesEhrDataTransfer: '',
    ehrDataTransferType: '',
    isConsentRequired: '',
    efic: '',
    irbTypes: [],
    regulatoryClassifications: [],
    clinicalTrialsGovId: '',
    isDsmbDmcRequired: '',
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
    const api = useContext(ApiContext)
    const classes = useStyles()
    
    useEffect(() => {
        setCurrentSubformNumer(0)
        setValues({ ...emptyFormValues, proposalID: proposalID })
    }, [props.proposalID])

    const handleNavigate = value => event => {
        setCurrentSubformNumer((currentSubformNumber + value + subforms.length) % subforms.length)
    }

    const handleSave = () => {
        console.log(values)
        axios.post(api.studyMetrics, values)
            .then(response => console.log(response))
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
                    <Button color="primary" onClick={ handleSave }>Save</Button>
                </CardActions>
            </div>
        </MetricsFormContext.Provider>
    )
}

export default MetricsForm