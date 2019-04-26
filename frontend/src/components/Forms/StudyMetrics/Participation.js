import React, { useContext } from 'react'
import { FormControl, FormHelperText, FormLabel, TextField } from '@material-ui/core'
import { MetricsFormContext } from './Metrics'

const StudyArchitectureForms = props => {
    const [values, setValues] = useContext(MetricsFormContext)
    const { classes } = props

    const handleChange = name => event => {
        setValues({ ...values, [name]: event.target.value })
    }

    return (
        <div>
            <FormControl className={ classes.formControl }>
                <FormLabel>Participating Sites</FormLabel>
                <FormHelperText>
                    Number of planned sites to be activated at study onset.
                </FormHelperText>
                <TextField margin="normal" variant="outlined"
                    id="initial-participating-site-number"
                    value={ values.initialParticipatingSiteNumber } onChange={ handleChange('initialParticipatingSiteNumber') }
                />
            </FormControl>

            <FormControl className={ classes.formControl }>
                <FormLabel>Enrollment Goal</FormLabel>
                <FormHelperText>
                    Enter the total projected sample size at the study onset.
                    This value should NOT reflect subsequent sample size changes related to protocol amendments.
                    Leave this field blank for Registry studies.
                </FormHelperText>
                <TextField margin="normal" variant="outlined"
                    id="enrollment-goal"
                    value={ values.enrollmentGoal } onChange={ handleChange('enrollmentGoal') }
                />
            </FormControl>

            <FormControl className={ classes.formControl }>
                <FormLabel>Participating Sites</FormLabel>
                <FormHelperText>
                    Enter time-period in months. Leave this field blank for Registry studies.
                </FormHelperText>
                <TextField margin="normal" variant="outlined"
                    id="initial-projected-enrollment-duration"
                    value={ values.initialProjectedEnrollmentDuration } onChange={ handleChange('initialProjectedEnrollmentDuration') }
                />
            </FormControl>
        </div>
    )
}

export default StudyArchitectureForms