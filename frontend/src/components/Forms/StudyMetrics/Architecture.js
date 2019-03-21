import React, { useContext } from 'react'
import {
    FormControl, FormGroup, FormHelperText, FormControlLabel, FormLabel,
    InputLabel, OutlinedInput,
    Select, MenuItem,
    RadioGroup, Radio,
    TextField,
    Checkbox,
    Button,
} from '@material-ui/core'
import { MetricsFormContext } from './Metrics'

const StudyArchitectureForms = props => {
    const [values, setValues] = useContext(MetricsFormContext)
    const { classes } = props

    const handleChange = name => event => {
        switch (name) {
            case 'randomizationFeatures':
                const feature = event.target.value
                const currentFeatures = values.randomizationFeatures
                const featureIndex = currentFeatures.indexOf(feature)
                if (featureIndex === -1) { currentFeatures.push(feature) }
                    else { currentFeatures.splice(featureIndex, 1) }
                setValues({ ...values, randomizationFeatures: currentFeatures })
                break
            case 'irbTypes':
                const type = event.target.value
                const currentTypes = values.irbTypes
                const typeIndex = currentTypes.indexOf(type)
                if (typeIndex === -1) { currentTypes.push(type) }
                    else { currentTypes.splice(typeIndex, 1) }
                setValues({ ...values, irbTypes: currentTypes })
                break
            case 'regulatoryClassifications':
                const classification = event.target.value
                const currentClassifications = values.regulatoryClassifications
                const classificationIndex = currentClassifications.indexOf(classification)
                if (classificationIndex === -1) { currentClassifications.push(classification) }
                    else { currentClassifications.splice(classificationIndex, 1) }
                setValues({ ...values, regulatoryClassifications: currentClassifications })
                break
            default:
                setValues({ ...values, [name]: event.target.value })
        }
    }

    return (
        <div>
            <FormControl className={ classes.formControl }>
                <FormLabel>Study Design</FormLabel>
                <FormHelperText>
                    Enter study design attributes.
                </FormHelperText>
                <RadioGroup aria-label="study-design" name="study-design"
                    value={ values.studyDesign } onChange={ handleChange('studyDesign') }
                >
                    <FormControlLabel value="interventional" control={ <Radio /> } label="Interventional" />
                    <FormControlLabel value="observational" control={ <Radio /> } label="Observational" />
                </RadioGroup>
            </FormControl>

            <FormControl className={ classes.formControl }>
                <FormLabel>Randomized</FormLabel>
                <RadioGroup aria-label="randomized" name="randomized"
                    value={ values.isRandomized } onChange={ handleChange('isRandomized') }
                >
                    <FormControlLabel value="1" control={ <Radio /> } label="Yes" />
                    <FormControlLabel value="0" control={ <Radio /> } label="No" />
                </RadioGroup>
            </FormControl>

            {
                values.isRandomized == '1' && 
                <FormControl className={ classes.formControl }>
                    <FormLabel>Randomization Unit</FormLabel>
                    <RadioGroup aria-label="randomization-unit" name="randomization-unit"
                        value={ values.randomizationUnit } onChange={ handleChange('randomizationUnit') }
                    >
                        <FormControlLabel value="cluster" control={ <Radio /> } label="Cluster" />
                        <FormControlLabel value="individual" control={ <Radio /> } label="Individual" />
                    </RadioGroup>
                </FormControl>
            }

            {
                values.isRandomized == '1' &&
                <FormControl className={ classes.formControl }>
                    <FormLabel>Randomization Features</FormLabel>
                    <FormHelperText>
                        Select all that apply.
                    </FormHelperText>
                    <FormGroup>
                        {
                            ['simple-randomization', 'block-randomization', 'response-adaptive-randomization', 'stratified-randomization', 'covariate-adaptive-randomization'].map(featureName => {
                                return (
                                    <FormControlLabel
                                        key={ featureName }
                                        control={
                                            <Checkbox
                                                checked={ values.randomizationFeatures.includes(featureName) }
                                                onChange={ handleChange('randomizationFeatures') }
                                                value={ featureName }
                                            />
                                        }
                                        label={ featureName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') }
                                    />
                                )
                            })
                        }
                    </FormGroup>
                </FormControl>
            }

            <FormControl className={ classes.formControl }>
                <FormLabel>Ascertainment</FormLabel>
                <RadioGroup aria-label="ascertainment" name="ascertainment"
                    value={ values.ascertainment } onChange={ handleChange('ascertainment') }
                >
                    <FormControlLabel value="retrospective" control={ <Radio /> } label="Retrospective" />
                    <FormControlLabel value="observational" control={ <Radio /> } label="Observational" />
                </RadioGroup>
            </FormControl>

            <FormControl className={ classes.formControl }>
                <FormLabel>Observations</FormLabel>
                <RadioGroup aria-label="observations" name="observations"
                    value={ values.observations } onChange={ handleChange('observations') }
                >
                    <FormControlLabel value="cross-sectional" control={ <Radio /> } label="Cross-sectional" />
                    <FormControlLabel value="longitudinal" control={ <Radio /> } label="Longitudinal" />
                </RadioGroup>
            </FormControl>

            <FormControl className={ classes.formControl }>
                <FormLabel>Phase</FormLabel>
                <RadioGroup aria-label="phase" name="phase"
                    value={ values.phase } onChange={ handleChange('phase') }
                >
                    {
                        ['pilot', 'phase-1', 'phase-2', 'phase-3', 'phase-4', 'phase-5'].map(
                            phaseName => <FormControlLabel control={ <Radio /> } value={ phaseName }
                                label={ (phaseName.charAt(0).toUpperCase() + phaseName.slice(1)).replace('-', ' ') }
                            />
                        )
                    }
                </RadioGroup>
            </FormControl>

            <FormControl className={ classes.formControl }>
                <FormLabel>Registry Data</FormLabel>
                <FormHelperText>
                    Does this study use registry data?
                </FormHelperText>
                <RadioGroup aria-label="usesRegistryData" name="usesRegistryData"
                    value={ values.usesRegistryData } onChange={ handleChange('usesRegistryData') }
                >
                    <FormControlLabel value="1" control={ <Radio /> } label="Yes" />
                    <FormControlLabel value="0" control={ <Radio /> } label="No" />
                </RadioGroup>
            </FormControl>

            <FormGroup row>
                <FormControl className={ classes.formControl }>
                    <FormLabel>EHR Data Transfer</FormLabel>
                    <FormHelperText>
                        Will this study use EHR Data Transfer?
                    </FormHelperText>
                    <RadioGroup aria-label="usesEhrDataTransfer" name="usesEhrDataTransfer"
                        value={ values.usesEhrDataTransfer } onChange={ handleChange('usesEhrDataTransfer') }
                    >
                        <FormControlLabel value="1" control={ <Radio /> } label="Yes" />
                        <FormControlLabel value="0" control={ <Radio /> } label="No" />
                    </RadioGroup>
                </FormControl>
        
                {
                    values.usesEhrDataTransfer === '1' &&
                    <FormControl className={ classes.formControl }>
                        <FormLabel>EHR Data Transfer</FormLabel>
                        <FormHelperText>
                            Will this study use full or partial EHR Data Transfer?
                        </FormHelperText>
                        <RadioGroup aria-label="ehr-data-transfer-type" name="ehr-data-transfer-type"
                            value={ values.ehrDataTransferType } onChange={ handleChange('ehrDataTransferType') }
                        >
                            <FormControlLabel value="full" control={ <Radio /> } label="Full" />
                            <FormControlLabel value="partial" control={ <Radio /> } label="Partial" />
                        </RadioGroup>
                    </FormControl>
                }
            </FormGroup>

            <FormControl className={ classes.formControl }>
                <FormLabel>Consent</FormLabel>
                <FormHelperText>
                    Does this study require informed consent for participants?
                </FormHelperText>
                <RadioGroup aria-label="consent-required" name="consent-required"
                    value={ values.isConsentRequired } onChange={ handleChange('isConsentRequired') }
                >
                    <FormControlLabel value="1" control={ <Radio /> } label="Yes" />
                    <FormControlLabel value="0" control={ <Radio /> } label="No" />
                </RadioGroup>
            </FormControl>

            <FormControl className={ classes.formControl }>
                <FormLabel>EFIC</FormLabel>
                <FormHelperText>
                    Is EFIC (exception from informed consent) used?
                </FormHelperText>
                <RadioGroup aria-label="efic" name="efic"
                    value={ values.efic } onChange={ handleChange('efic') }
                >
                    <FormControlLabel value="1" control={<Radio />} label="Yes" />
                    <FormControlLabel value="0" control={<Radio />} label="No" />
                </RadioGroup>
            </FormControl>

            <FormControl component="fieldset" fullWidth className={ classes.formControl }>
                <FormLabel>IRB Types</FormLabel>
                <FormHelperText>
                    Select the type(s) of IRB used for this study.
                    Select all that apply.
                </FormHelperText>
                <FormGroup>
                    <FormControlLabel label="Academic Single IRB, Commercial Single IRB"
                        control={ <Checkbox checked={ values.irbTypes.includes('academic-commercial-single-irb') }
                        value="academic-commercial-single-irb" onChange={ handleChange('irbTypes') } /> }
                    />
                    <FormControlLabel label="Local IRB(s)"
                        control={ <Checkbox checked={ values.irbTypes.includes('local-irb') }
                        value="local-irb" onChange={ handleChange('irbTypes') } /> }
                    />
                    <FormControlLabel label="VA Single IRB, VA Local IRB"
                        control={ <Checkbox checked={ values.irbTypes.includes('va-single-local-irb') }
                        value="va-single-local-irb" onChange={ handleChange('irbTypes') } /> }
                    />
                </FormGroup>
            </FormControl>

             <FormControl className={ classes.formControl }>
                <FormLabel>Regulatory Classification</FormLabel>
                <FormHelperText>
                    Select applicable regulatory status(es).
                </FormHelperText>
                <FormGroup>
                    {
                        ['Requires IND', 'Requires IDE', 'Requires NSR', 'Post-marketing Study', 'Not Subject to FDA Regulation'].map(classification => {
                            const classificationKebabCase = classification.toLowerCase().replace(' ', '-')
                            return (
                                <FormControlLabel key={ classificationKebabCase }
                                    control={
                                        <Checkbox checked={ values.regulatoryClassifications.includes(classificationKebabCase) }
                                            value={ classificationKebabCase }
                                            onChange={ handleChange('regulatoryClassifications') }
                                        />
                                    }
                                    label={ classification }
                                />
                            )
                        })
                    }
                </FormGroup>
            </FormControl>

            <FormControl className={ classes.formControl }>
                <FormLabel>ClinicalTrials.gov Identifier</FormLabel>
                <FormHelperText>
                    If applicable, enter the ClinicalTrials.gov identifier.
                </FormHelperText>
                <TextField margin="normal" variant="outlined" id="clinical-trials-gov-id"
                    value={ values.clinicalTrialsGovId } onChange={ handleChange('clinicalTrialsGovId') }
                />
            </FormControl>

            <FormControl component="fieldset" fullWidth className={ classes.formControl }>
                <FormLabel component="legend">DSMB/DMC</FormLabel>
                <FormHelperText>
                    Is a DSMB/DMC required for this study?
                </FormHelperText>
                <RadioGroup aria-label="dsmb-dmc-required" name="dsmb-dmc-required"
                    value={ values.isDsmbDmcRequired } onChange={ handleChange('isDsmbDmcRequired') }
                >
                    <FormControlLabel value="1" control={ <Radio /> } label="Yes" />
                    <FormControlLabel value="0" control={ <Radio /> } label="No" />
                </RadioGroup>
            </FormControl>

        </div>
    )
}

export default StudyArchitectureForms