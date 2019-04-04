import React, { useContext } from 'react'
import {
    FormControl, FormHelperText, FormControlLabel, FormLabel,
    RadioGroup, Radio, TextField, Checkbox,
} from '@material-ui/core'
import { MetricsFormContext } from './Metrics'

const StudyFundingForm = props => {
    const [values, setValues] = useContext(MetricsFormContext)
    const { classes } = props

    const handleChange = name => event => {
        setValues({ ...values, [name]: event.target.value })
    }

    const handleToggle = name => event => {
        setValues({ ...values, [name]: event.target.checked })
    }

    return (
        <div>
            <FormControl className={ classes.formControl }>
                <FormLabel component="label">Awardee Site Acronym</FormLabel>
                <FormHelperText>
                    Enter 4-letter acronym for institution that received primary grant award for study funding (typically the lead PIs site). If the DCC was the awardee, enter DCC. Enter NA if not applicable.
                </FormHelperText>
                <TextField fullWidth
                    id="awardee-site-acronym"
                    value={ values.awardeeSiteAcronym }
                    onChange={ handleChange('awardeeSiteAcronym') }
                    margin="normal"
                    variant="outlined"
                />
            </FormControl>

            <FormControl className={ classes.formControl }>
                <FormLabel component="label">Primary Funding Type</FormLabel>
                <FormHelperText>
                    Select the original/primary funding type utilized to support the overall project.
                </FormHelperText>
                <RadioGroup
                    aria-label="primary-funding-type"
                    name="primary-funding-type"
                    value={ values.primaryFundingType }
                    onChange={ handleChange('primaryFundingType') }
                >
                    <FormControlLabel value="academic-or-institutional" control={<Radio />} label="Academic or Instititutional" />
                    <FormControlLabel value="government" control={<Radio />} label="Government" />
                    <FormControlLabel value="industry" control={<Radio />} label="Industry" />
                    <FormControlLabel value="private" control={<Radio />} label="Private, Philanthropic, Non-Profit, Foundation" />
                </RadioGroup>
            </FormControl>

            <FormControl className={ classes.formControl }>
                <FormLabel component="label">Primarily Funded by Infrastructure</FormLabel>
                <FormControlLabel
                    control={ <Checkbox checked={ values.primarilyFundedByInfrastructure === true } onChange={ handleToggle('primarilyFundedByInfrastructure') } /> }
                    label={
                        <FormHelperText>
                            Is primary funding source to support the study considered network infrastructure funding? For example, if there is no external grant funding (e.g. an R01), a study might be supported by infrastructure funds.
                        </FormHelperText>
                    }
                />
            </FormControl>

            <FormControl className={ classes.formControl }>
                <FormLabel component="label">Funding Source</FormLabel>
                <FormHelperText>
                    Enter name of primary funding source for the study.
                </FormHelperText>
                <TextField fullWidth
                    id="funding-source"
                    value={ values.fundingSource }
                    onChange={ handleChange('fundingSource') }
                    margin="normal"
                    variant="outlined"
                />
            </FormControl>

            <FormControl className={ classes.formControl }>
                <FormLabel component="label">Date Funding was Awarded</FormLabel>
                <FormHelperText>
                    Date study funding awarded (for primary funding source).
                    For studies funded by gov't grants, enter initial grant award date from NOGA (Notice of Grant Award).
                    Leave blank if N/A.
                </FormHelperText>
                <TextField fullWidth
                    aria-label="funding-awarded-date"
                    value={ values.fundingAwardDate }
                    onChange={ handleChange('fundingAwardDate') }
                    margin="normal"
                    variant="outlined"
                />
            </FormControl>

            <FormControl className={ classes.formControl }>
                <FormLabel component="label">Previous Funding</FormLabel>
                <FormControlLabel
                    control={ <Checkbox checked={ values.previousFunding === true } onChange={ handleToggle('previousFunding') } /> }
                    label={
                        <FormHelperText>
                            Was this study preceded or supported by a previous planning grant (e.g. R34, K award, etc)?
                        </FormHelperText>
                    }
                />
            </FormControl>

        </div>
    )
}

export default StudyFundingForm