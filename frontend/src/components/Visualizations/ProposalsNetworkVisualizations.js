import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import proposalsNetwork from './proposalsNetwork';
import proposalsSankey from './proposalsSankey';

function combine(a, b) {
    if (a.length > 0 && b.length > 0) {
        return a.filter(function(item) {
            return b.indexOf(item) !== -1;
        });
    }
    else if (a.length > 0) {
        return a.slice();
    }
    else {
      return b.slice();
    }
}

class ProposalsNetworkVisualizations extends Component {
    constructor(props) {
        super(props);

        this.state = {
            windowWidth: 0,
            windowHeight: 0,
            selectedProposals: []
        };

        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
        this.highlightProposals = this.highlightProposals.bind(this);
        this.selectProposals = this.selectProposals.bind(this);

        this.network = proposalsNetwork()
            .on("highlightProposals", this.highlightProposals)
            .on("selectProposals", this.selectProposals);

        this.sankey = proposalsSankey()
            .on("highlightProposals", this.highlightProposals)
            .on("selectProposals", this.selectProposals);
    }

    updateWindowDimensions() {
        // Should cause a re-render if the window size has changed
        this.setState({
            windowWidth: window.width,
            windowHeight: window.height
        });
    }

    highlightProposals(proposals) {
        this.network.highlightProposals(proposals);
        this.sankey.highlightProposals(proposals);
    }

    selectProposals(proposals) {
        this.setState({
          selectedProposals: !proposals ? [] : combine(this.state.selectedProposals, proposals)
        });
    }

    componentDidMount() {
        this.updateWindowDimensions();

        this.drawVisualization(this.props, null, this.state);

        window.addEventListener('resize', this.updateWindowDimensions);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
    }

    shouldComponentUpdate(props, state) {
        this.drawVisualization(props, this.props, state);

        return false;
    }

    drawVisualization(newProps, oldProps, state) {
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

        if (!oldProps || newProps.proposals !== oldProps.proposals) {
            // Bind new data
            d3.select(this.networkDiv)
                .datum(newProps.proposals)
                .call(this.network);

            d3.select(this.sankeyDiv)
                .datum(newProps.proposals)
                .call(this.sankey);
        }

        const combined = combine(newProps.filteredProposals, state.selectedProposals);

        this.network.selectProposals(combined);
        this.sankey.selectProposals(combined);
    }

    render() {
        let outerStyle = { display: 'flex', flexWrap: 'wrap', width: '100%'};
        let innerStyle = { width: '800px', flex: '1 1 auto' };

        return (
            <div style={outerStyle}>
                <div style={innerStyle} ref={div => this.networkDiv = div}></div>
                <div style={innerStyle} ref={div => this.sankeyDiv = div}></div>
            </div>
        );
    }
}

ProposalsNetworkVisualizations.propTypes = {
    proposals: PropTypes.arrayOf(PropTypes.object).isRequired,
    filteredProposals: PropTypes.arrayOf(PropTypes.number).isRequired
};

export default ProposalsNetworkVisualizations
