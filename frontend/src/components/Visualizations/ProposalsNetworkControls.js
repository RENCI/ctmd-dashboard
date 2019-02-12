import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles'
import {
    FormControl, FormHelperText,
    InputLabel, OutlinedInput,
    Select, MenuItem
} from '@material-ui/core';

const styles = (theme) => ({
    form: {
        ...theme.mixins.debug,
    },
    formControl: {
        margin: `${ 2 * theme.spacing.unit }px 0`,
    },
    formControlLabel: {
        // flex: 1,
    },
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

class ProposalsNetworkControls extends Component {
    state = {
        status: defaultStatus,
        labelWidth: 0
    };

    handleStatusSelect = event => {
        let status = event.target.value;

        this.setState({
            status: status
        });

        this.props.onChange("status", event);
    };

    componentDidMount() {
        this.setState({
            labelWidth: ReactDOM.findDOMNode(this.InputLabelRef).offsetWidth
        });
    }

    render() {
        const { classes, proposals } = this.props;

        // Memoize this?
        let statusItems = getStatusItems(proposals);

        return (
            <FormControl variant="outlined" fullWidth className={ classes.formControl }>
                <InputLabel htmlFor="status" ref={ ref => { this.InputLabelRef = ref } }>
                    Status
                </InputLabel>
                <Select
                    className={ classes.select }
                    value={ this.state.status }
                    onChange={ this.handleStatusSelect }
                    input={
                        <OutlinedInput
                            labelWidth={ this.state.labelWidth }
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
}

ProposalsNetworkControls.propTypes = {
    proposals: PropTypes.arrayOf(PropTypes.object).isRequired,
    onChange: PropTypes.func.isRequired
};

export default withStyles(styles)(ProposalsNetworkControls)
