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
                <FormLabel>Network</FormLabel>
                <FormHelperText>
                    Select study network(s).
                    If no network exists, select ‘Non-network Trial’.
                    If a project overlaps two networks, select multiple.
                </FormHelperText>
                <Select
                    value={ values.network }
                    onChange={ handleChange('network') }
                    input={ <OutlinedInput fullWidth labelWidth={ 0 } name="network" id="network" style={{ marginTop: '16px' }}/> }
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
            </FormControl>
            
            <FormControl className={ classes.formControl }>
                <FormLabel component="label">Primary Study Type</FormLabel>
                <Select
                    value={ values.primaryStudyType }
                    onChange={ handleChange('primaryStudyType') }
                    input={ <OutlinedInput fullWidth labelWidth={ 0 } name="primary-study-type" id="primary-study-type" style={{ marginTop: '16px' }} /> }
                >
                    <MenuItem value=""></MenuItem>
                    <MenuItem value="registry">Registry</MenuItem>
                    <MenuItem value="clinical-trial">Clinical Trial</MenuItem>
                    <MenuItem value="ehr-data-transfer">EHR Data Transfer</MenuItem>
                </Select>
            </FormControl>

            <FormControl className={ classes.formControl }>
                <FormLabel component="label">TIC</FormLabel>
                <FormHelperText>
                    Primary TIC on the study
                </FormHelperText>
                <Select
                    value={ values.tic }
                    onChange={ handleChange('tic') }
                    input={ <OutlinedInput fullWidth labelWidth={ 0 } name="tic" id="tic" style={{ marginTop: '16px' }} /> }
                >
                    <MenuItem value=""></MenuItem>
                    <MenuItem value="utah">Duke</MenuItem>
                    <MenuItem value="duke-vanderbilt">Duke/Vanderbilt</MenuItem>
                    <MenuItem value="jhu-tufts">JHU/Tufts</MenuItem>
                    <MenuItem value="n/a">N/A</MenuItem>
                </Select>
            </FormControl>

            <FormControl className={ classes.formControl }>
                <FormLabel component="label">RIC</FormLabel>
                <Select
                    value={ values.ric }
                    onChange={ handleChange('ric') }
                    input={ <OutlinedInput fullWidth labelWidth={ 0 } name="ric" id="ric" style={{ marginTop: '16px' }} /> }
                >
                    <MenuItem value=""></MenuItem>
                    <MenuItem value="vanderbilt">Vanderbilt</MenuItem>
                    <MenuItem value="n/a">N/A</MenuItem>
                </Select>
            </FormControl>

            <FormControl className={ classes.formControl }>
                <FormLabel component="label">Collaborative TIC</FormLabel>
                <Select
                    value={ values.collaborativeTic }
                    onChange={ handleChange('collaborativeTic') }
                    input={ <OutlinedInput fullWidth labelWidth={ 0 } name="collaborative-tic" id="collaborative-tic" style={{ marginTop: '16px' }} /> }
                >
                    <MenuItem value=""></MenuItem>
                    <MenuItem value="utah">Duke</MenuItem>
                    <MenuItem value="duke-vanderbilt">Duke/Vanderbilt</MenuItem>
                    <MenuItem value="jhu-tufts">JHU/Tufts</MenuItem>
                    <MenuItem value="n/a">N/A</MenuItem>
                </Select>
            </FormControl>

            <FormControl className={ classes.formControl }>
                <FormLabel component="label">Collaborative TIC Role Explain</FormLabel>
                <FormHelperText>
                    Type a description about the role of the collaborative TIC.
                </FormHelperText>
                <TextField fullWidth
                    id="collaborative-tic-details"
                    value={ values.collaborativeTicDetails }
                    onChange={ handleChange('collaborativeTicDetails') }
                    margin="normal"
                    variant="outlined"
                    disabled={ values.collaborativeTic === 'n/a' || values.collaborativeTic === '' }
                    error={ values.collaborativeTic !== 'n/a' && values.collaborativeTicDetails.trim() === '' }
                />
            </FormControl>

            <FormControl className={ classes.formControl }>
                <FormLabel component="label">DCC Institution</FormLabel>
                <FormHelperText>
                    Enter the Data Coordinating Center for the study
                </FormHelperText>
                <TextField fullWidth
                    id="dcc"
                    value={ values.dcc }
                    onChange={ handleChange('dcc') }
                    margin="normal"
                    variant="outlined"
                />
            </FormControl>

            <FormControl className={ classes.formControl }>
                <FormLabel component="label">CCC Institution</FormLabel>
                <FormHelperText>
                    Enter the Clinical Coordinating Center for the study.
                </FormHelperText>
                <TextField fullWidth
                    id="ccc"
                    value={ values.ccc }
                    onChange={ handleChange('ccc') }
                    margin="normal"
                    variant="outlined"
                />
            </FormControl>

        </div>
    )
}

export default StudyCharacteristicsForms