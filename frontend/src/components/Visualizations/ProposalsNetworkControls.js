import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import {
    Grid,
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

const defaultValue = "All";

function getItems(proposals, key) {
    const values = proposals.reduce((p, c) => {
        let value = c[key];
        if (value && p.indexOf(value) === -1) p.push(value);
        return p;
    }, []).sort();

    return [defaultValue].concat(values).map((value, i) =>
        <MenuItem key={ i } value={ value }>{ value }</MenuItem>
    );
}

function ProposalsNetworkControls(props) {
    const [pi, setPI] = useState(defaultValue);
    const [proposal, setProposal] = useState(defaultValue);
    const [org, setOrg] = useState(defaultValue);
    const [tic, setTic] = useState(defaultValue);
    const [status, setStatus] = useState(defaultValue);
    const [area, setArea] = useState(defaultValue);

    // There must be a better way than setting these all separately
    const [piLabelWidth, setPILabelWidth] = useState(0);
    const [proposalLabelWidth, setProposalLabelWidth] = useState(0);
    const [orgLabelWidth, setOrgLabelWidth] = useState(0);
    const [ticLabelWidth, setTicLabelWidth] = useState(0);
    const [statusLabelWidth, setStatusLabelWidth] = useState(0);
    const [areaLabelWidth, setAreaLabelWidth] = useState(0);

    const piLabelRef = useRef(null);
    const proposalLabelRef = useRef(null);
    const orgLabelRef = useRef(null);
    const ticLabelRef = useRef(null);
    const statusLabelRef = useRef(null);
    const areaLabelRef = useRef(null);

    const { classes, proposals, onChange } = props;

    useEffect(() => {
        setPILabelWidth(ReactDOM.findDOMNode(piLabelRef.current).offsetWidth);
        setProposalLabelWidth(ReactDOM.findDOMNode(proposalLabelRef.current).offsetWidth);
        setOrgLabelWidth(ReactDOM.findDOMNode(orgLabelRef.current).offsetWidth);
        setTicLabelWidth(ReactDOM.findDOMNode(ticLabelRef.current).offsetWidth);
        setStatusLabelWidth(ReactDOM.findDOMNode(statusLabelRef.current).offsetWidth);
        setAreaLabelWidth(ReactDOM.findDOMNode(areaLabelRef.current).offsetWidth);
    }, [piLabelRef]);

    function handleSelect(type, event) {
        const value = event.target.value;

        switch (type) {
           case "pi": setPI(value); break;
           case "proposal": setProposal(value); break;
           case "org": setOrg(value); break;
           case "tic": setTic(value); break;
           case "status": setStatus(value); break;
           case "area": setArea(value); break;
        }

        onChange(type, event);
    };

    const piItems = useMemo(() => getItems(proposals, 'piName'), [proposals]);
    const proposalItems = useMemo(() => getItems(proposals, 'shortTitle'), [proposals]);
    const orgItems = useMemo(() => getItems(proposals, 'submitterInstitution'), [proposals]);
    const ticItems = useMemo(() => getItems(proposals, 'assignToInstitution'), [proposals]);
    const areaItems = useMemo(() => getItems(proposals, 'therapeuticArea'), [proposals]);
    const statusItems = useMemo(() => getItems(proposals, 'proposalStatus'), [proposals]);

    function dropDown(type, value, label, helperText, items, ref, labelWidth) {
        return (
            <FormControl variant="outlined" fullWidth className={ classes.formControl }>
                <InputLabel htmlFor="type" ref={ ref }>
                    { label }
                </InputLabel>
                <Select
                    className={ classes.select }
                    value={ value }
                    onChange={ e => handleSelect(type, e) }
                    input={
                        <OutlinedInput
                            labelWidth={ labelWidth }
                            name={ type }
                            id={ type }
                        />
                    }
                >
                    { items }
                </Select>
                <FormHelperText>
                    { "Specify " + helperText + " to highlight." }
                </FormHelperText>
            </FormControl>
        );
    }

    return (
        <Grid container wrap={'nowrap'}>
            { dropDown("pi", pi, "PI", "PI", piItems, piLabelRef, piLabelWidth) }
            { dropDown("proposal", proposal, "Proposal", "proposal", proposalItems, proposalLabelRef, proposalLabelWidth) }
            { dropDown("org", org, "Organization", "organization", orgItems, orgLabelRef, orgLabelWidth) }
            { dropDown("tic", tic, "TIC", "TIC", ticItems, ticLabelRef, ticLabelWidth) }
            { dropDown("status", status, "Status", "proposal status", statusItems, statusLabelRef, statusLabelWidth) }
            { dropDown("area", area, "Therapeutic Area", "therapeutic area", areaItems, areaLabelRef, areaLabelWidth) }
        </Grid>
    );
}

ProposalsNetworkControls.propTypes = {
    proposals: PropTypes.arrayOf(PropTypes.object).isRequired,
    onChange: PropTypes.func.isRequired
};

export default withStyles(styles)(ProposalsNetworkControls)
