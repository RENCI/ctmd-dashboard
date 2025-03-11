import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import {
    Grid,
    FormControl, FormHelperText, FormLabel,
    InputLabel, OutlinedInput,
    Select, MenuItem, Checkbox, ListItemText
} from '@material-ui/core';

const styles = (theme) => ({
    formControl: {
        margin: `${ theme.spacing(2) }px 0`,
    },
    formControlLabel: {},
    select: {}
});

function getItems(proposals, key) {
    const values = proposals.reduce((p, c) => {
        const value = c[key];

        if (!value) {
          return p;
        }
        else if (Array.isArray(value)) {
          value.forEach(d => {
            if (p.indexOf(d) === -1) p.push(d);
          });
        }
        else {
          if (p.indexOf(value) === -1) p.push(value);
        }

        return p;
    }, []).sort();

    return key === "requestedServices" ? values :
        values.map((value, i) => <MenuItem key={ i } value={ value }>{ value }</MenuItem>);
}

function ProposalsNetworkControls({ classes, proposals, selectedNodes, onChange }) {
    // There must be a better way than setting these all separately
    const [piLabelWidth, setPILabelWidth] = useState(0);
    const [proposalLabelWidth, setProposalLabelWidth] = useState(0);
    const [orgLabelWidth, setOrgLabelWidth] = useState(0);
    const [ticLabelWidth, setTicLabelWidth] = useState(0);
    const [statusLabelWidth, setStatusLabelWidth] = useState(0);
    const [areaLabelWidth, setAreaLabelWidth] = useState(0);
    const [resourceLabelWidth, setResourceLabelWidth] = useState(0);

    const piLabelRef = useRef(null);
    const proposalLabelRef = useRef(null);
    const orgLabelRef = useRef(null);
    const ticLabelRef = useRef(null);
    const statusLabelRef = useRef(null);
    const areaLabelRef = useRef(null);
    const resourceLabelRef = useRef(null);

    useEffect(() => {
        setPILabelWidth(ReactDOM.findDOMNode(piLabelRef.current).offsetWidth);
        setProposalLabelWidth(ReactDOM.findDOMNode(proposalLabelRef.current).offsetWidth);
        setOrgLabelWidth(ReactDOM.findDOMNode(orgLabelRef.current).offsetWidth);
        setTicLabelWidth(ReactDOM.findDOMNode(ticLabelRef.current).offsetWidth);
        setStatusLabelWidth(ReactDOM.findDOMNode(statusLabelRef.current).offsetWidth);
        setAreaLabelWidth(ReactDOM.findDOMNode(areaLabelRef.current).offsetWidth);
        setResourceLabelWidth(ReactDOM.findDOMNode(resourceLabelRef.current).offsetWidth);
    }, [piLabelRef]);

    // XXX: Store MenuItems for single selection dropdowns
    const piItems = useMemo(() => getItems(proposals, 'piName'), [proposals]);
    const proposalItems = useMemo(() => getItems(proposals, 'shortTitle'), [proposals]);
    const orgItems = useMemo(() => getItems(proposals, 'submitterInstitution'), [proposals]);
    const ticItems = useMemo(() => getItems(proposals, 'assignToInstitution'), [proposals]);
    const areaItems = useMemo(() => getItems(proposals, 'therapeuticArea'), [proposals]);
    const statusItems = useMemo(() => getItems(proposals, 'proposalStatus'), [proposals]);
    const resourceItems = useMemo(() => getItems(proposals, 'requestedServices'), [proposals]);

    function dropDown(type, label, helperText, items, ref, labelWidth) {
        const multi = type === "resource";

        let values = selectedNodes.filter(node => node.type === type).map(node => node.name);
        
        values = multi ? values : values.length > 0 ? values[0] : "";

        return (
            <Grid item xs>
                <FormControl variant="outlined" fullWidth className={ classes.formControl }>
                    <InputLabel htmlFor="type" ref={ ref }>
                        { label }
                    </InputLabel>
                    <Select
                        className={ classes.select }
                        value={ values }
                        multiple={ multi }
                        onChange={ e => onChange(type, e) }
                        input={
                            <OutlinedInput
                                labelWidth={ labelWidth }
                                name={ type }
                                id={ type }
                            />
                        }
                        renderValue={ multi ? selected => selected.join(', ') : null }
                    >
                        { multi ? 
                            items.map((item, i) => (
                                <MenuItem key={ i } value={ item }>
                                    <Checkbox checked={ values.includes(item) } />
                                    <ListItemText primary={ item } />
                                </MenuItem>
                            ))
                            : items                        
                        }
                    </Select>
                    <FormHelperText>
                        { "Specify " + helperText + " to highlight." }
                    </FormHelperText>
                </FormControl>
            </Grid>
        );
    }

    const labelStyle = { marginBottom: '10px' };

    return (
        <>
            <div style={ labelStyle }>
                <FormLabel >
                    Choose dropdown options to highlight proposal categories and connections
                </FormLabel>
            </div>
            <Grid container wrap={'wrap'}>
                { dropDown("tic", "TIC/RIC", "TIC/RIC", ticItems, ticLabelRef, ticLabelWidth) }
                { dropDown("resource", "Resources requested", "resources requested", resourceItems, resourceLabelRef, resourceLabelWidth) }
                { dropDown("status", "Status", "proposal status", statusItems, statusLabelRef, statusLabelWidth) }
                { dropDown("org", "CTSA/Organization", "CTSA/organization", orgItems, orgLabelRef, orgLabelWidth) }
                { dropDown("area", "Therapeutic area", "therapeutic area", areaItems, areaLabelRef, areaLabelWidth) }
                { dropDown("pi", "PI", "PI", piItems, piLabelRef, piLabelWidth) }
                { dropDown("proposal", "Proposal", "proposal", proposalItems, proposalLabelRef, proposalLabelWidth) }
            </Grid>
        </>
    );
}

ProposalsNetworkControls.propTypes = {
    proposals: PropTypes.arrayOf(PropTypes.object).isRequired,
    onChange: PropTypes.func.isRequired
};

export default withStyles(styles)(ProposalsNetworkControls)
