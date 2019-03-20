import React, { useContext } from 'react'
import { makeStyles } from '@material-ui/styles'
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

const useStyles = makeStyles(theme => ({
    formControl: {
        width: '100%',
        marginBottom: `${ 4 * theme.spacing.unit }px`,
    },
}))

const StudyArchitectureForms = props => {
    const [values, setValues] = useContext(MetricsFormContext)
    const classes = useStyles()

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
            default:
                setValues({ ...values, [name]: event.target.value })
        }
    }

    return (
        <div>
            <FormControl className={ classes.formControl }>
                <FormLabel component="label">Study Design</FormLabel>
                <FormHelperText>
                    Enter study design attributes.
                </FormHelperText>
                <RadioGroup
                    aria-label="study-design"
                    name="study-design"
                    value={ values.studyDesign }
                    onChange={ handleChange('studyDesign') }
                >
                    <FormControlLabel value="interventional" control={ <Radio /> } label="Interventional" />
                    <FormControlLabel value="observational" control={ <Radio /> } label="Observational" />
                </RadioGroup>
            </FormControl>

            <FormControl className={ classes.formControl }>
                <FormLabel component="label">Randomized</FormLabel>
                <RadioGroup
                    aria-label="randomized"
                    name="randomized"
                    value={ values.isRandomized }
                    onChange={ handleChange('isRandomized') }
                >
                    <FormControlLabel value="1" control={ <Radio /> } label="Yes" />
                    <FormControlLabel value="0" control={ <Radio /> } label="No" />
                </RadioGroup>
            </FormControl>

            <FormControl className={ classes.formControl }>
                <FormLabel component="label">Randomization Unit</FormLabel>
                <RadioGroup
                    aria-label="randomization-unit"
                    name="randomization-unit"
                    value={ values.randomizationUnit }
                    onChange={ handleChange('randomizationUnit') }
                >
                    <FormControlLabel value="cluster" control={ <Radio /> } label="Cluster" />
                    <FormControlLabel value="individual" control={ <Radio /> } label="Individual" />
                </RadioGroup>
            </FormControl>

            <FormControl className={ classes.formControl }>
                <FormLabel component="label">Randomization Features</FormLabel>
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
        </div>
    )
}

export default StudyArchitectureForms