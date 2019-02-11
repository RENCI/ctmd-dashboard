import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import classnames from 'classnames'
import { withStyles } from '@material-ui/core/styles'
import {
    FormControl, FormHelperText,
    InputLabel, OutlinedInput,
    Select, MenuItem
} from '@material-ui/core';
import * as d3 from 'd3';
import proposalsNetwork from './proposalsNetwork';
import proposalsSankey from './proposalsSankey';

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

class ProposalsNetworkContainer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            windowWidth: 0,
            windowHeight: 0,
            proposals: null,
            statuses: [],
            status: "none",
            labelWidth: 0
        };

        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
        this.handleStatusSelect = this.handleStatusSelect.bind(this);
        this.sankeyHighlightProposals = this.sankeyHighlightProposals.bind(this);
        this.networkHighlightProposals = this.networkHighlightProposals.bind(this);

        this.network = proposalsNetwork()
            .on("highlightProposals", this.networkHighlightProposals);

        this.sankey = proposalsSankey()
            .on("highlightProposals", this.sankeyHighlightProposals);
    }

    updateWindowDimensions() {
        // Should cause a re-render if the window size has changed
        this.setState({
            windowWidth: window.width,
            windowHeight: window.height
        });
    }

    handleStatusSelect(event) {
      let status = event.target.value;

      this.setState({
          status: status
      });
    }

    networkHighlightProposals(proposals) {
      this.sankey.highlightProposals(proposals);
    }

    sankeyHighlightProposals(proposals) {
      this.network.highlightProposals(proposals);
    }

    async fetchData() {
        await axios.get(this.props.apiUrl)
            .then(response => {
                this.setState({
                    proposals: response.data,
                    statuses: response.data.reduce((p, c) => {
                        let status = c.proposal_status;
                        if (p.indexOf(status) === -1) p.push(status);
                        return p;
                    }, [])
                });
            })
            .catch(error => {
                console.error('Error:', error)
            });
    }

    componentWillMount = this.fetchData;

    componentDidMount() {
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);

        this.setState({
            labelWidth: ReactDOM.findDOMNode(this.InputLabelRef).offsetWidth
        });
    }

    shouldComponentUpdate(props, state) {
        if (state.proposals) {
            this.drawVisualization(props, state);
        }

        //return false;
        return true;
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
    }

    drawVisualization(props, state) {
        const minSankeyHeight = 1000;
        const networkWidth = this.networkDiv.clientWidth;
        const networkHeight = networkWidth;
        const sankeyWidth = this.sankeyDiv.clientWidth;
        const sankeyHeight = Math.max(minSankeyHeight, sankeyWidth);

        this.network
            .width(networkWidth)
            .height(networkHeight);

        this.sankey
            .width(sankeyWidth)
            .height(sankeyHeight);

        d3.select(this.networkDiv)
            .datum(state.proposals)
            .call(this.network);

        d3.select(this.sankeyDiv)
            .datum(state.proposals)
            .call(this.sankey);

        let proposals = state.proposals.filter(proposal =>
          proposal.proposal_status === state.status
        ).map(proposal => proposal.proposal_id);

        this.network.highlightProposals(proposals);
        this.sankey.highlightProposals(proposals);
    }

    render() {
        const { classes } = this.props;

        let outerStyle = { display: 'flex', flexWrap: 'wrap', width: '100%'};
        let innerStyle = { width: '800px', flex: '1 1 auto' };

        let statusItems = this.state.statuses.map((status, i) =>
            <MenuItem key={i} value={status}>{status}</MenuItem>
        );

        return (
            <div>
                <FormControl variant="outlined" fullWidth className={ classes.formControl }>
                    <InputLabel htmlFor="status" ref={ ref => { this.InputLabelRef = ref } }>
                        Status
                    </InputLabel>
                    <Select
                        className={ classes.select }
                        value={this.state.status}
                        onChange={this.handleStatusSelect}
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

                <div style={outerStyle}>
                    <div style={innerStyle} ref={div => this.networkDiv = div}></div>
                    <div style={innerStyle} ref={div => this.sankeyDiv = div}></div>
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(ProposalsNetworkContainer)
