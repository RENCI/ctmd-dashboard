import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import classnames from 'classnames'
import { withStyles } from '@material-ui/core/styles'
import {
    FormControl, FormGroup, FormHelperText, FormControlLabel, FormLabel,
    InputLabel, OutlinedInput,
    Select, MenuItem,
    RadioGroup, Radio,
    TextField,
    Checkbox,
} from '@material-ui/core'
import Subheading from '../Typography/Subheading'

const styles = (theme) => ({
    form: {
        ...theme.mixins.debug,
    },
    formControl: {
        margin: `${ 2 * theme.spacing.unit }px 0`,
    },
    radioGroup: { },
    horizontalRadioGroup: {
        flexDirection: 'row',
    },
    formControlLabel: {
        // flex: 1,
    },
    select: {},
})

class MetricsForm extends Component {
    state = {
        network: '',
        tic: '',
        studyAcronym: '',
        studyFullName: '',
        primaryStudyType: '',
        linkedData: '',
        linkedStudy: '',
        isRandomized: '',
        randomizationUnit: '',
        randomizationFeatures: [],
        phase: '',
        pilotOrDemo: '',
        isRegistry: '',
        isEhrDataTransfer: '',
        isConsentRequired: '',
        efic: '',
        irbTypes: [],
        regulatoryClassifications: [],
        clinicalTrialsGovId: '',
        dsmbDmcRequired: '',
        initialParticipatingSiteNumber: '',
        enrollmentGoal: '',
        initialProjectedEnrollmentDuration: '',
        leadPiNames: '',
        awardeeSiteAcronym: '',
        primaryFundingType: '',
        primarilyFundedByInfrastructure: '',
        fundingSource: '',
        fundingAwarded: '',
        previousFunding: '',
        labelWidth: 0,
    }

    handleChange = (name) => (event) => {
        switch (name) {
            case 'randomizationFeatures':
                const feature = event.target.value
                const currentFeatures = this.state.randomizationFeatures
                const featureIndex = currentFeatures.indexOf(feature)
                if (featureIndex === -1) { currentFeatures.push(feature) }
                    else { currentFeatures.splice(featureIndex, 1) }
                this.setState(state => ({ randomizationFeatures: currentFeatures }))
                break
            case 'irbTypes':
                const type = event.target.value
                const currentTypes = this.state.irbTypes
                const typeIndex = currentTypes.indexOf(type)
                if (typeIndex === -1) { currentTypes.push(type) }
                    else { currentTypes.splice(typeIndex, 1) }
                this.setState(state => ({ irbTypes: currentTypes }))
                break
            case 'regulatoryClassifications':
                const classification = event.target.value
                const currentClassifications = this.state.regulatoryClassifications
                const classificationIndex = currentClassifications.indexOf(classification)
                if (classificationIndex === -1) { currentClassifications.push(classification) }
                    else { currentClassifications.splice(classificationIndex, 1) }
                this.setState(state => ({ regulatoryClassifications: currentClassifications }))
                break
            default:
                this.setState({ [name]: event.target.value })
        }
    }

    componentDidMount() {
        this.setState({
            labelWidth: ReactDOM.findDOMNode(this.InputLabelRef).offsetWidth,
        })
    }

    render() {
        const { classes } = this.props
        return (
            <div>

                <Subheading>Study Characteristics</Subheading>
                
                <FormControl variant="outlined" fullWidth className={ classes.formControl }>
                    <InputLabel htmlFor="network" ref={ ref => { this.InputLabelRef = ref } }>
                        Network
                    </InputLabel>
                    <Select
                        className={ classes.select }
                        value={ this.state.network }
                        onChange={ this.handleChange('network') }
                        input={
                            <OutlinedInput
                                labelWidth={ this.state.labelWidth }
                                name="network"
                                id="network"
                            />
                        }
                    >
                        <MenuItem value=""></MenuItem>
                        <MenuItem value="ahcrn">AHCRN</MenuItem>
                        <MenuItem value="4cyc">4CYC</MenuItem>
                        <MenuItem value="cpccrn">CPCCRN</MenuItem>
                        <MenuItem value="fhs">FHS</MenuItem>
                        <MenuItem value="gjcf">GJCF</MenuItem>
                        <MenuItem value="hcrn">HCRN</MenuItem>
                        <MenuItem value="pcplc">PCPLC</MenuItem>
                        <MenuItem value="pecarn">PECARN</MenuItem>
                        <MenuItem value="npmsc">NPMSC</MenuItem>
                        <MenuItem value="thapca">THAPCA</MenuItem>
                        <MenuItem value="tin">TIN</MenuItem>
                        <MenuItem value="non-network">Non-network Trial</MenuItem>
                    </Select>
                    <FormHelperText>
                        Specify study network(s). If no network exists, select ‘Non-network Trial’. If a project overlaps two networks, select multiple.
                    </FormHelperText>
                </FormControl>

                <FormControl variant="outlined" fullWidth className={ classes.formControl }>
                    <InputLabel htmlFor="tic" ref={ ref => { this.InputLabelRef = ref } }>
                        TIC/RIC
                    </InputLabel>
                    <Select
                        className={ classes.select }
                        value={ this.state.tic }
                        onChange={ this.handleChange('tic') }
                        input={
                            <OutlinedInput
                                labelWidth={ this.state.labelWidth }
                                name="tic"
                                id="tic"
                            />
                        }
                    >
                        <MenuItem value=""></MenuItem>
                        <MenuItem value="utah-tic">Utah TIC</MenuItem>
                        <MenuItem value="duke-vanderbilt-tic">Duke/Vanderbilt TIC</MenuItem>
                        <MenuItem value="jhu-tufts-tic">JHU/Tufts TIC</MenuItem>
                        <MenuItem value="vanderbilt-ric">Vanderbilt RIC</MenuItem>
                    </Select>
                </FormControl>

                <FormControl variant="outlined" fullWidth className={ classes.formControl }>
                    <FormHelperText>
                        Enter study short name or acronym.
                    </FormHelperText>
                    <TextField
                        id="study-acronym"
                        label="Study Acronym"
                        className={ classes.textField }
                        value={ this.state.studyAcronym }
                        onChange={ this.handleChange('studyAcronym') }
                        margin="normal"
                        variant="outlined"
                    />
                </FormControl>

                <FormControl variant="outlined" fullWidth className={ classes.formControl }>
                    <FormHelperText>
                        Enter full study name.
                    </FormHelperText>
                    <TextField
                        id="study-full-name"
                        label="Study Full Name"
                        className={ classes.textField }
                        value={ this.state.studyFullName }
                        onChange={ this.handleChange('studyFullName') }
                        margin="normal"
                        variant="outlined"
                    />
                </FormControl>

                <FormControl variant="outlined" fullWidth className={ classes.formControl }>
                    <InputLabel htmlFor="primary-study-type" ref={ ref => { this.InputLabelRef = ref } }>
                        Primary Study Type
                    </InputLabel>
                    <Select
                        className={ classes.select }
                        value={ this.state.primaryStudyType }
                        onChange={ this.handleChange('primaryStudyType') }
                        input={
                            <OutlinedInput
                                labelWidth={ this.state.labelWidth }
                                name="primary-study-type"
                                id="primary-study-type"
                            />
                        }
                    >
                        <MenuItem value=""></MenuItem>
                        <MenuItem value="registry">Registry</MenuItem>
                        <MenuItem value="clinical-trial">Clinical Trial</MenuItem>
                        <MenuItem value="ehr-data-transfer">EHR Data Transfer</MenuItem>
                    </Select>
                </FormControl>

                <FormControl component="fieldset" className={ classes.formControl }>
                    <FormLabel component="legend">Linked Data</FormLabel>
                    <RadioGroup
                        aria-label="linked-data"
                        name="linked-data"
                        className={ classnames(classes.radioGroup, classes.horizontalRadioGroup) }
                        value={ this.state.linkedData }
                        onChange={ this.handleChange('linkedData') }
                    >
                        <FormControlLabel value="1" control={<Radio />} label="Yes" />
                        <FormControlLabel value="0" control={<Radio />} label="No" />
                    </RadioGroup>
                    <FormHelperText>
                        Does this study require data from a different study? May be referred to as a 'Linked', 'Piggybacked', 'Ancillary', or 'Sub' study. This should be answered as "No" for a Registry.
                    </FormHelperText>
                </FormControl>

                <FormControl variant="outlined" fullWidth className={ classes.formControl }>
                    <TextField
                        id="linked-study"
                        label="Linked Data (Specify Study)"
                        className={ classes.textField }
                        value={ this.state.linkedStudy }
                        onChange={ this.handleChange('linkedStudy') }
                        margin="normal"
                        variant="outlined"
                        disabled={ this.state.linkedData !== '1' }
                        error={ this.state.linkedData === '1' && this.state.linkedStudy === '' }
                    />
                    <FormHelperText>
                        If the study requires data from a different study, specify the name of the 'linked study' using the Study Acronym.
                    </FormHelperText>
                </FormControl>

                <Subheading>Study Architecture</Subheading>
                
                <FormControl component="fieldset" fullWidth className={ classes.formControl }>
                    <FormLabel component="legend">Study Design</FormLabel>
                    <RadioGroup
                        aria-label="study-design"
                        name="study-design"
                        className={ classes.radioGroup }
                        value={ this.state.studyDesign }
                        onChange={ this.handleChange('studyDesign') }
                    >
                        <FormControlLabel value="interventional" control={<Radio />} label="Interventional" />
                        <FormControlLabel value="observational" control={<Radio />} label="Observational" />
                    </RadioGroup>
                    <FormHelperText>
                        Enter study design attributes.
                    </FormHelperText>
                </FormControl>

                <FormControl component="fieldset" fullWidth className={ classes.formControl }>
                    <FormLabel component="legend">Randomized</FormLabel>
                    <RadioGroup
                        aria-label="randomized"
                        name="randomized"
                        className={ classnames(classes.radioGroup, classes.horizontalRadioGroup) }
                        value={ this.state.isRandomized }
                        onChange={ this.handleChange('isRandomized') }
                    >
                        <FormControlLabel value="1" control={<Radio />} label="Yes" />
                        <FormControlLabel value="0" control={<Radio />} label="No" />
                    </RadioGroup>
                </FormControl>

                <FormControl component="fieldset" fullWidth className={ classes.formControl }>
                    <FormLabel component="legend">Randomization Unit</FormLabel>
                    <RadioGroup
                        aria-label="randomization-unit"
                        name="randomization-unit"
                        className={ classes.radioGroup }
                        value={ this.state.randomizationUnit }
                        onChange={ this.handleChange('randomizationUnit') }
                    >
                        <FormControlLabel value="cluster" control={<Radio />} label="Cluster" />
                        <FormControlLabel value="individual" control={<Radio />} label="Individual" />
                    </RadioGroup>
                </FormControl>

                <FormControl component="fieldset" fullWidth className={ classes.formControl }>
                    <FormHelperText>
                        Select all that apply.
                    </FormHelperText>
                    <FormLabel component="legend">Randomization Features</FormLabel>
                        <FormGroup>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={ this.state.randomizationFeatures.includes('simple-randomization') }
                                        onChange={ this.handleChange('randomizationFeatures') }
                                        value="simple-randomization"
                                    />
                                }
                                label="Simple Randomization"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={ this.state.randomizationFeatures.includes('block-randomization') }
                                        onChange={ this.handleChange('randomizationFeatures') }
                                        value="block-randomization"
                                    />
                                }
                                label="Block Randomization"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={ this.state.randomizationFeatures.includes('response-adaptive-randomization') }
                                        onChange={ this.handleChange('randomizationFeatures') }
                                        value="response-adaptive-randomization"
                                    />
                                }
                                label="Response Adaptive Randomization"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={ this.state.randomizationFeatures.includes('stratified-randomization') }
                                        onChange={ this.handleChange('randomizationFeatures') }
                                        value="stratified-randomization"
                                    />
                                }
                                label="Stratified Randomization"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={ this.state.randomizationFeatures.includes('covariate-adaptive-randomization') }
                                        onChange={ this.handleChange('randomizationFeatures') }
                                        value="covariate-adaptive-randomization"
                                    />
                                }
                                label="Covariate-Adaptive Randomization"
                            />
                        </FormGroup>
                </FormControl>

                <FormControl component="fieldset" fullWidth className={ classes.formControl }>
                    <FormLabel component="legend">Phase</FormLabel>
                    <RadioGroup
                        aria-label="phase"
                        name="phase"
                        className={ classes.radioGroup }
                        value={ this.state.phase }
                        onChange={ this.handleChange('phase') }
                    >
                        <FormControlLabel value="pilot" control={<Radio />} label="Pilot" />
                        <FormControlLabel value="phase-1" control={<Radio />} label="Phase 1" />
                        <FormControlLabel value="phase-2" control={<Radio />} label="Phase 2" />
                        <FormControlLabel value="phase-3" control={<Radio />} label="Phase 3" />
                        <FormControlLabel value="phase-4" control={<Radio />} label="Phase 4" />
                        <FormControlLabel value="not-applicable" control={<Radio />} label="Not Applicable" />
                    </RadioGroup>
                </FormControl>

                <FormControl component="fieldset" fullWidth className={ classes.formControl }>
                    <FormLabel component="legend">Pilot or Demo Study</FormLabel>
                    <RadioGroup
                        aria-label="pilot-or-demo-study"
                        name="pilot-or-demo-study"
                        className={ classnames(classes.radioGroup, classes.horizontalRadioGroup) }
                        value={ this.state.isPilotOrDemo }
                        onChange={ this.handleChange('isPilotOrDemo') }
                    >
                        <FormControlLabel value="1" control={<Radio />} label="Yes" />
                        <FormControlLabel value="0" control={<Radio />} label="No" />
                    </RadioGroup>
                </FormControl>

                <FormControl component="fieldset" fullWidth className={ classes.formControl }>
                    <FormLabel component="legend">Registry</FormLabel>
                    <RadioGroup
                        aria-label="registry"
                        name="registry"
                        className={ classnames(classes.radioGroup, classes.horizontalRadioGroup) }
                        value={ this.state.isRegistry }
                        onChange={ this.handleChange('isRegistry') }
                    >
                        <FormControlLabel value="1" control={<Radio />} label="Yes" />
                        <FormControlLabel value="0" control={<Radio />} label="No" />
                    </RadioGroup>
                </FormControl>

                <FormControl component="fieldset" fullWidth className={ classes.formControl }>
                    <FormLabel component="legend">EHR Data Transfer</FormLabel>
                    <RadioGroup
                        aria-label="ehr-data-transfer"
                        name="ehr-data-transfer"
                        className={ classnames(classes.radioGroup, classes.horizontalRadioGroup) }
                        value={ this.state.isEhrDataTransfer }
                        onChange={ this.handleChange('isEhrDataTransfer') }
                    >
                        <FormControlLabel value="1" control={<Radio />} label="Yes" />
                        <FormControlLabel value="0" control={<Radio />} label="No" />
                    </RadioGroup>
                </FormControl>

                <FormControl component="fieldset" fullWidth className={ classes.formControl }>
                    <FormHelperText>
                        Does this study require informed consent for participants?
                    </FormHelperText>
                    <FormLabel component="legend">Consent</FormLabel>
                    <RadioGroup
                        aria-label="consent-required"
                        name="consent-required"
                        className={ classnames(classes.radioGroup, classes.horizontalRadioGroup) }
                        value={ this.state.isConsentRequired }
                        onChange={ this.handleChange('isConsentRequired') }
                    >
                        <FormControlLabel value="1" control={<Radio />} label="Yes" />
                        <FormControlLabel value="0" control={<Radio />} label="No" />
                    </RadioGroup>
                </FormControl>

                <FormControl component="fieldset" fullWidth className={ classes.formControl }>
                    <FormHelperText>
                        Is EFIC (exception from informed consent) used?
                    </FormHelperText>
                    <FormLabel component="legend">EFIC</FormLabel>
                    <RadioGroup
                        aria-label="efic"
                        name="efic"
                        className={ classnames(classes.radioGroup, classes.horizontalRadioGroup) }
                        value={ this.state.efic }
                        onChange={ this.handleChange('efic') }
                    >
                        <FormControlLabel value="1" control={<Radio />} label="Yes" />
                        <FormControlLabel value="0" control={<Radio />} label="No" />
                    </RadioGroup>
                </FormControl>

                <FormControl component="fieldset" fullWidth className={ classes.formControl }>
                    <FormHelperText>
                        Select the type(s) of IRB used for this study. Select all that apply.
                    </FormHelperText>
                    <FormLabel component="legend">IRB Type</FormLabel>
                    <FormGroup>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={ this.state.irbTypes.includes('central-irb') }
                                    onChange={ this.handleChange('irbTypes') }
                                    value="central-irb"
                                />
                            }
                            label="Central IRB"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={ this.state.irbTypes.includes('local-irb') }
                                    onChange={ this.handleChange('irbTypes') }
                                    value="local-irb"
                                />
                            }
                            label="Local IRB(s)"
                        />
                    </FormGroup>
                </FormControl>

                <FormControl component="fieldset" fullWidth className={ classes.formControl }>
                    <FormHelperText>
                        Select applicable regulatory status(es).
                    </FormHelperText>
                    <FormLabel component="legend">Regulatory Classification</FormLabel>
                        <FormGroup>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={ this.state.regulatoryClassifications.includes('requires-ind') }
                                        onChange={ this.handleChange('regulatoryClassifications') }
                                        value="requires-ind"
                                    />
                                }
                                label="Requires IND (drug)"
                            />
                        </FormGroup>
                        <FormGroup>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={ this.state.regulatoryClassifications.includes('requires-ide') }
                                        onChange={ this.handleChange('regulatoryClassifications') }
                                        value="requires-ide"
                                    />
                                }
                                label="Requires IDE (device)"
                            />
                        </FormGroup>
                        <FormGroup>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={ this.state.regulatoryClassifications.includes('requires-nsr') }
                                        onChange={ this.handleChange('regulatoryClassifications') }
                                        value="requires-nsr"
                                    />
                                }
                                label="Requires NSR device approval (by FDA or all IRBs"
                            />
                        </FormGroup>
                        <FormGroup>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={ this.state.regulatoryClassifications.includes('post-marketing-study') }
                                        onChange={ this.handleChange('regulatoryClassifications') }
                                        value="post-marketing-study"
                                    />
                                }
                                label="Post-marketing Study (under approved NDA/PMA/510K)"
                            />
                        </FormGroup>
                        <FormGroup>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={ this.state.regulatoryClassifications.includes('not-subject-to-fda-regulation') }
                                        onChange={ this.handleChange('regulatoryClassifications') }
                                        value="not-subject-to-fda-regulation"
                                    />
                                }
                                label="Not Subject to FDA Regulation"
                            />
                        </FormGroup>
                </FormControl>

                <FormControl variant="outlined" fullWidth className={ classes.formControl }>
                    <FormHelperText>
                        If applicable, enter the ClinicalTrials.gov identifier.
                    </FormHelperText>
                    <TextField
                        id="clinical-tTrials-gov-id"
                        label="ClinicalTrials.gov Identifier"
                        className={ classes.textField }
                        value={ this.state.clinicalTrialsGovId }
                        onChange={ this.handleChange('clinicalTrialsGovId') }
                        margin="normal"
                        variant="outlined"
                    />
                </FormControl>

                <FormControl component="fieldset" fullWidth className={ classes.formControl }>
                    <FormHelperText>
                        Is a DSMB/DMC required for this study?
                    </FormHelperText>
                    <FormLabel component="legend">DSMB/DMC Required</FormLabel>
                    <RadioGroup
                        aria-label="dsmb-dmc-required"
                        name="dsmb-dmc-required"
                        className={ classnames(classes.radioGroup, classes.horizontalRadioGroup) }
                        value={ this.state.dsmbDmcRequired }
                        onChange={ this.handleChange('dsmbDmcRequired') }
                    >
                        <FormControlLabel value="1" control={<Radio />} label="Yes" />
                        <FormControlLabel value="0" control={<Radio />} label="No" />
                    </RadioGroup>
                </FormControl>

                <FormControl variant="outlined" fullWidth className={ classes.formControl }>
                    <FormHelperText>
                        Number of planned sites to be activated at study onset.
                    </FormHelperText>
                    <TextField
                        id="initial-participating-site-number"
                        label="Initial Participating Site Number"
                        className={ classes.textField }
                        value={ this.state.initialParticipatingSiteNumber }
                        onChange={ this.handleChange('initialParticipatingSiteNumber') }
                        margin="normal"
                        variant="outlined"
                    />
                </FormControl>

                <FormControl variant="outlined" fullWidth className={ classes.formControl }>
                    <FormHelperText>
                        Total projected sample size at study onset. This # should NOT reflect subsequent sample size changes related to protocol amendments. Leave this field blank for Registry studies.
                    </FormHelperText>
                    <TextField
                        id="enrollment-goal"
                        label="Enrollment Goal"
                        className={ classes.textField }
                        value={ this.state.enrollmentGoal }
                        onChange={ this.handleChange('enrollmentGoal') }
                        margin="normal"
                        variant="outlined"
                    />
                </FormControl>

                <FormControl variant="outlined" fullWidth className={ classes.formControl }>
                    <FormHelperText>
                        Enter time-period in months. Leave this field blank for Registry studies.
                    </FormHelperText>
                    <TextField
                        id="initial-projected-enrollment-duration"
                        label="Initial Projected Enrollment Duration"
                        className={ classes.textField }
                        value={ this.state.initialProjectedEnrollmentDuration }
                        onChange={ this.handleChange('initialProjectedEnrollmentDuration') }
                        margin="normal"
                        variant="outlined"
                    />
                </FormControl>

                <FormControl variant="outlined" fullWidth className={ classes.formControl }>
                    <FormHelperText>
                        Enter <i>FirstName LastName</i> of lead study PI. If there are multiple PIs, list all names with the primary PI first.
                    </FormHelperText>
                    <TextField
                        id="lead-pi-names"
                        label="Lead PI Names"
                        className={ classes.textField }
                        value={ this.state.leadPiNames }
                        onChange={ this.handleChange('leadPiNames') }
                        margin="normal"
                        variant="outlined"
                    />
                </FormControl>

                <Subheading>Funding</Subheading>

                <FormControl variant="outlined" fullWidth className={ classes.formControl }>
                    <FormHelperText>
                        Enter 4-letter acronym for institution that received primary grant award for study funding (typically the lead PIs site). If the DCC was the awardee, enter DCC. Enter NA if not applicable.
                    </FormHelperText>
                    <TextField
                        id="awardee-site-acronym"
                        label="Awardee Site Acronym"
                        className={ classes.textField }
                        value={ this.state.awardeeSiteAcronym }
                        onChange={ this.handleChange('awardeeSiteAcronym') }
                        margin="normal"
                        variant="outlined"
                    />
                </FormControl>

                <FormControl component="fieldset" className={ classes.formControl }>
                    <FormHelperText>
                        Select the original/primary funding type utilized to support the overall project.
                    </FormHelperText>
                    <FormLabel component="legend">Primary Funding Type</FormLabel>
                    <RadioGroup
                        aria-label="primary-funding-type"
                        name="primary-funding-type"
                        className={ classes.radioGroup }
                        value={ this.state.primaryFundingType }
                        onChange={ this.handleChange('primaryFundingType') }
                    >
                        <FormControlLabel value="academic-or-institutional" control={<Radio />} label="Academic or Instititutional" />
                        <FormControlLabel value="government" control={<Radio />} label="Government" />
                        <FormControlLabel value="industry" control={<Radio />} label="Industry" />
                        <FormControlLabel value="private" control={<Radio />} label="Private, Philanthropic, Non-Profit, Foundation" />
                    </RadioGroup>
                </FormControl>

                <FormControl component="fieldset" fullWidth className={ classes.formControl }>
                    <FormHelperText>
                        Is primary funding source to support the study considered network infrastructure funding? For example, if there is no external grant funding (e.g. an R01), a study might be supported by infrastructure funds.
                    </FormHelperText>
                    <FormLabel component="legend">Primarily Funded by Infrastructure</FormLabel>
                    <RadioGroup
                        aria-label="primarily-funded-byinfrastructure"
                        name="primarily-funded-byinfrastructure"
                        className={ classnames(classes.radioGroup, classes.horizontalRadioGroup) }
                        value={ this.state.primarilyFundedByInfrastructure }
                        onChange={ this.handleChange('primarilyFundedByInfrastructure') }
                    >
                        <FormControlLabel value="1" control={<Radio />} label="Yes" />
                        <FormControlLabel value="0" control={<Radio />} label="No" />
                    </RadioGroup>
                </FormControl>

                <FormControl variant="outlined" fullWidth className={ classes.formControl }>
                    <FormHelperText>
                        Enter name of primary funding source for the study.
                    </FormHelperText>
                    <TextField
                        id="funding-source"
                        label="Funding Source"
                        className={ classes.textField }
                        value={ this.state.fundingSource }
                        onChange={ this.handleChange('fundingSource') }
                        margin="normal"
                        variant="outlined"
                    />
                </FormControl>

                <FormControl component="fieldset" fullWidth className={ classes.formControl }>
                    <FormHelperText>
                        Date study funding awarded (for primary funding source). For studies funded by gov't grants, enter initial grant award date from NOGA (Notice of Grant Award). Leave missing if NA.
                    </FormHelperText>
                    <TextField
                        aria-label="funding-awarded-datez"
                        label="Date Funding was Awarded"
                        className={ classes.textField }
                        value={ this.state.fundingAwardedDate }
                        onChange={ this.handleChange('fundingAwardedDate') }
                        margin="normal"
                        variant="outlined"
                    />
                </FormControl>

                <FormControl component="fieldset" fullWidth className={ classes.formControl }>
                    <FormLabel component="legend">Previous Funding</FormLabel>
                    <FormHelperText>
                        Was this study preceded or supported by a previous planning grant (e.g. R34, K award, etc)?
                    </FormHelperText>
                    <RadioGroup
                        aria-label="previous-funding"
                        name="previous-funding"
                        className={ classnames(classes.radioGroup, classes.horizontalRadioGroup) }
                        value={ this.state.previousFunding }
                        onChange={ this.handleChange('previousFunding') }
                    >
                        <FormControlLabel value="1" control={<Radio />} label="Yes" />
                        <FormControlLabel value="0" control={<Radio />} label="No" />
                    </RadioGroup>
                </FormControl>

            </div>
        )
    }
}

export default withStyles(styles)(MetricsForm)