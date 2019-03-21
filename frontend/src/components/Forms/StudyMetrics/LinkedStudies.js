import React, { useContext } from 'react'
import { makeStyles } from '@material-ui/styles'
import {
    FormControl, FormHelperText, FormControlLabel, FormLabel,
    OutlinedInput,
    Select, MenuItem,
    RadioGroup, Radio,
    TextField,
} from '@material-ui/core'
import { MetricsFormContext } from './Metrics'

const useStyles = makeStyles(theme => ({
    formControl: {
        width: '100%',
        marginBottom: `${ 4 * theme.spacing.unit }px`,
    },
}))

const StudyCharacteristicsForms = props => {
    const [values, setValues] = useContext(MetricsFormContext)
    const classes = useStyles()

    const handleChange = name => event => {
        setValues({ ...values, [name]: event.target.value })
    }

    return (
        <div>
            <FormControl className={ classes.formControl }>
                <FormLabel component="label">Linked Data</FormLabel>
                <FormHelperText>
                    Does this study require data from another study?
                    May be referred to as a "Linked", "Piggybacked", "Ancillary", or "Sub" study.
                    This should be answered as "No" for a Registry.
                </FormHelperText>
                <RadioGroup
                    aria-label="has-super-study"
                    name="has-super-study"
                    value={ values.hasSuperStudy }
                    onChange={ handleChange('hasSuperStudy') }
                >
                    <FormControlLabel value="1" control={ <Radio /> } label="Yes" />
                    <FormControlLabel value="0" control={ <Radio /> } label="No" />
                </RadioGroup>
            </FormControl>

            <FormControl className={ classes.formControl }>
                <FormLabel component="label">Linked Study</FormLabel>
                <FormHelperText>
                    Specify main study.
                    If the study requires data from a different study, specify the name of the "linked study" using the Study Acronym.
                </FormHelperText>
                <TextField fullWidth
                    id="super-study"
                    value={ values.superStudy }
                    onChange={ handleChange('superStudy') }
                    margin="normal"
                    variant="outlined"
                    disabled={ values.hasSuperStudy !== '1' }
                    error={ values.hasSuperStudy === '1' || values.hasSuperStudy === '' }
                />
            </FormControl>

            <FormControl className={ classes.formControl }>
                <FormLabel component="label">Does this study have substudies?</FormLabel>
                <FormHelperText>
                    Is data from this study required by another study?
                </FormHelperText>
                <RadioGroup
                    aria-label="has-subStudy"
                    name="has-subStudy"
                    value={ values.hasSubStudy }
                    onChange={ handleChange('hasSubStudy') }
                >
                    <FormControlLabel value="1" control={ <Radio /> } label="Yes" />
                    <FormControlLabel value="0" control={ <Radio /> } label="No" />
                </RadioGroup>
            </FormControl>

            <FormControl className={ classes.formControl }>
                <FormLabel component="label">Linked Substudy</FormLabel>
                <TextField fullWidth
                    id="subStudy"
                    value={ values.subStudy }
                    onChange={ handleChange('subStudy') }
                    margin="normal"
                    variant="outlined"
                    disabled={ values.hasSubStudy !== '1' }
                    error={ values.hasSubStudy === '1' || values.hasSubStudy === '' }
                />
            </FormControl>
        </div>
    )
}

export default StudyCharacteristicsForms