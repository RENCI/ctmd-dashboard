import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import {
    FormControl, FormHelperText,
    InputLabel, OutlinedInput,
    Select, MenuItem
} from '@material-ui/core';

const styles = (theme) => ({
    formControl: {
        margin: `${ 2 * theme.spacing.unit }px 0`,
    },
    formControlLabel: {},
    select: {}
});

const defaultStatus = "All";

function getStatusItems(proposals) {
    const statuses = proposals.reduce((p, c) => {
        let status = c.proposal_status;
        if (p.indexOf(status) === -1) p.push(status);
        return p;
    }, []);

    return [defaultStatus].concat(statuses).map((status, i) =>
        <MenuItem key={i} value={status}>{status}</MenuItem>
    );
}

function ProposalsNetworkControls(props) {
    const [status, setStatus] = useState(defaultStatus);
    const [labelWidth, setLabelWidth] = useState(0);

    const inputLabelRef = useRef(null);

    const { classes, proposals, onChange } = props;

    useEffect(() => {
        setLabelWidth(ReactDOM.findDOMNode(inputLabelRef.current).offsetWidth);
    }, [inputLabelRef]);

    function handleStatusSelect(event) {
        let status = event.target.value;

        setStatus(status);

        onChange("status", event);
    };

    const statusItems = useMemo(() => getStatusItems(proposals), [proposals]);

    return (
        <FormControl variant="outlined" fullWidth className={ classes.formControl }>
            <InputLabel htmlFor="status" ref={ inputLabelRef }>
                Status
            </InputLabel>
            <Select
                className={ classes.select }
                value={ status }
                onChange={ handleStatusSelect }
                input={
                    <OutlinedInput
                        labelWidth={ labelWidth }
                        name="status"
                        id="status"
                    />
                }
            >
                {statusItems}
            </Select>
            <FormHelperText>
                Specify proposal status to highlight.
            </FormHelperText>
        </FormControl>
    );
}

ProposalsNetworkControls.propTypes = {
    proposals: PropTypes.arrayOf(PropTypes.object).isRequired,
    onChange: PropTypes.func.isRequired
};

export default withStyles(styles)(ProposalsNetworkControls)
