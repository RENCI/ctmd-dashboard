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

const StudyFundingForm = props => {
    const [values, setValues] = useContext(MetricsFormContext)

    const handleChange = name => event => {
        setValues({ ...values, [name]: event.target.value })
    }

    return (
        <div>
            <FormControl variant="outlined" fullWidth>
                <FormHelperText>
                    Enter 4-letter acronym for institution that received primary grant award for study funding (typically the lead PIs site). If the DCC was the awardee, enter DCC. Enter NA if not applicable.
                </FormHelperText>
                <TextField
                    id="awardee-site-acronym"
                    label="Awardee Site Acronym"
                    value={ values.awardeeSiteAcronym }
                    onChange={ handleChange('awardeeSiteAcronym') }
                    margin="normal"
                    variant="outlined"
                />
            </FormControl>

            <FormControl component="fieldset">
                <FormHelperText>
                    Select the original/primary funding type utilized to support the overall project.
                </FormHelperText>
                <FormLabel component="legend">Primary Funding Type</FormLabel>
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

            <FormControl component="fieldset" fullWidth>
                <FormHelperText>
                    Is primary funding source to support the study considered network infrastructure funding? For example, if there is no external grant funding (e.g. an R01), a study might be supported by infrastructure funds.
                </FormHelperText>
                <FormLabel component="legend">Primarily Funded by Infrastructure</FormLabel>
                <RadioGroup
                    aria-label="primarily-funded-byinfrastructure"
                    name="primarily-funded-byinfrastructure"
                    value={ values.primarilyFundedByInfrastructure }
                    onChange={ handleChange('primarilyFundedByInfrastructure') }
                >
                    <FormControlLabel value="1" control={<Radio />} label="Yes" />
                    <FormControlLabel value="0" control={<Radio />} label="No" />
                </RadioGroup>
            </FormControl>

            <FormControl variant="outlined" fullWidth>
                <FormHelperText>
                    Enter name of primary funding source for the study.
                </FormHelperText>
                <TextField
                    id="funding-source"
                    label="Funding Source"
                    value={ values.fundingSource }
                    onChange={ handleChange('fundingSource') }
                    margin="normal"
                    variant="outlined"
                />
            </FormControl>

            <FormControl component="fieldset" fullWidth>
                <FormHelperText>
                    Date study funding awarded (for primary funding source). For studies funded by gov't grants, enter initial grant award date from NOGA (Notice of Grant Award). Leave missing if NA.
                </FormHelperText>
                <TextField
                    aria-label="funding-awarded-datez"
                    label="Date Funding was Awarded"
                    value={ values.fundingAwardedDate }
                    onChange={ handleChange('fundingAwardedDate') }
                    margin="normal"
                    variant="outlined"
                />
            </FormControl>

            <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend">Previous Funding</FormLabel>
                <FormHelperText>
                    Was this study preceded or supported by a previous planning grant (e.g. R34, K award, etc)?
                </FormHelperText>
                <RadioGroup
                    aria-label="previous-funding"
                    name="previous-funding"
                    value={ values.previousFunding }
                    onChange={ handleChange('previousFunding') }
                >
                    <FormControlLabel value="1" control={<Radio />} label="Yes" />
                    <FormControlLabel value="0" control={<Radio />} label="No" />
                </RadioGroup>
            </FormControl>
        </div>
    )
}

export default StudyFundingForm