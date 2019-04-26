import React, { useContext } from 'react'
import { FormControl, FormHelperText, FormControlLabel, FormLabel, Checkbox, TextField } from '@material-ui/core'
import { MetricsFormContext } from './Metrics'

const StudyCharacteristicsForms = props => {
    const [values, setValues] = useContext(MetricsFormContext)
    const { classes } = props

    const handleToggle = name => event => {
        setValues({ ...values, [name]: event.target.checked })
    }

    const handleChange = name => event => {
        setValues({ ...values, [name]: event.target.value })
    }

    return (
        <div>
            <FormControl className={ classes.formControl }>
                <FormLabel component="label">Is this a substudy?</FormLabel>
                <FormControlLabel
                    control={ <Checkbox checked={ values.hasSuperStudy === true } onChange={ handleToggle('hasSuperStudy') } /> }
                    label={
                        <FormHelperText>
                            Does this study require data from another study?
                            May be referred to as a "Linked", "Piggybacked", "Ancillary", or "Sub" study.
                            This should be answered as "No" for a Registry.
                        </FormHelperText>
                    }
                />
            </FormControl>

            {
                values.hasSuperStudy === true && 
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
                        disabled={ values.hasSuperStudy !== true }
                        error={ values.hasSuperStudy === true && values.superStudy.trim() === '' }
                    />
                </FormControl>
            }

            <FormControl className={ classes.formControl }>
                <FormLabel component="label">Does this study have any substudies?</FormLabel>
                <FormControlLabel
                    control={ <Checkbox checked={ values.hasSubStudy === true } onChange={ handleToggle('hasSubStudy') } /> }
                    label={
                        <FormHelperText>
                            Is data from this study required by another study?
                        </FormHelperText>
                    }
                />
            </FormControl>
            
            {
                values.hasSubStudy === true &&
                <FormControl className={ classes.formControl }>
                    <FormLabel component="label">Linked Substudy</FormLabel>
                    <TextField fullWidth
                        id="subStudy"
                        value={ values.subStudy }
                        onChange={ handleChange('subStudy') }
                        margin="normal"
                        variant="outlined"
                        disabled={ values.hasSubStudy !== true }
                        error={ values.hasSubStudy === true && values.subStudy.trim() === '' }
                    />
                </FormControl>
            }
        </div>
    )
}

export default StudyCharacteristicsForms