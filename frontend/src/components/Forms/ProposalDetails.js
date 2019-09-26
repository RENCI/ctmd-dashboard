import React from 'react'
import {
    FormControl, FormGroup, FormHelperText, FormControlLabel, FormLabel,
    InputLabel, OutlinedInput,
    TextField,
} from '@material-ui/core'

export const ProposalDetailsForm = props => {
    const { proposal } = props
    return (
        <div>
            <FormControl variant="outlined" fullWidth>
                <TextField disabled id="study-full-name" label="Full Name" margin="normal" variant="outlined" value="add this to proposals query" />
            </FormControl>

            <FormControl variant="outlined" fullWidth>
                <TextField disabled id="tic" label="Assigned TIC/RIC" margin="normal" variant="outlined" value={ proposal.assignToInstitution || '' } />
            </FormControl>

            <FormControl variant="outlined" fullWidth>
                <TextField disabled id="submitting-institution" label="Submitting Institution" margin="normal" variant="outlined" value={ proposal.submitterInstitution || '' } />
            </FormControl>
        </div>
    )
}
