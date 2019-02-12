import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import proposalsNetwork from './proposalsNetwork';
import proposalsSankey from './proposalsSankey';

class ProposalsNetworkVisualizations extends Component {
    constructor(props) {
        super(props);

        this.state = {
            windowWidth: 0,
            windowHeight: 0
        };

        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
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

    networkHighlightProposals(proposals) {
        this.sankey.highlightProposals(proposals);
    }

    sankeyHighlightProposals(proposals) {
        this.network.highlightProposals(proposals);
    }

    componentDidMount() {
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
    }

    shouldComponentUpdate(props, state) {
        if (props.proposals.length > 0) {
            this.drawVisualization(props, state);
        }

        return false;
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

        if (props.proposals !== this.props.proposals) {
            // Bind new data
            d3.select(this.networkDiv)
                .datum(props.proposals)
                .call(this.network);

            d3.select(this.sankeyDiv)
                .datum(props.proposals)
                .call(this.sankey);
        }

        this.network.highlightProposals(props.selectedProposals);
        this.sankey.highlightProposals(props.selectedProposals);
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
    selectedProposals: PropTypes.arrayOf(PropTypes.number).isRequired
};

export default ProposalsNetworkVisualizations
