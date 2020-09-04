import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import { FormLabel } from '@material-ui/core';
import proposalsNetwork from './proposalsNetwork';
import proposalsSankey from './proposalsSankey';

class ProposalsNetworkVisualizations extends Component {
    constructor(props) {
        super(props);

        this.state = {
            windowWidth: 0
        };

        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
        this.highlightNodes = this.highlightNodes.bind(this);

        this.network = proposalsNetwork()
            .on("highlightNodes", this.highlightNodes)
            .on("selectNodes", this.props.onSelectNodes)
            .on("deselectNodes", this.props.onDeselectNodes);

        this.sankey = proposalsSankey()
            .on("highlightNodes", this.highlightNodes)
            .on("selectNodes", this.props.onSelectNodes)
            .on("deselectNodes", this.props.onDeselectNodes);
    }

    updateWindowDimensions() {
        // Should cause a re-render if the window size has changed
        this.setState({
            windowWidth: window.innerWidth
        });
    }

    highlightNodes(nodes) {
        this.network.highlightNodes(nodes);
        this.sankey.highlightNodes(nodes);
    }

    componentDidMount() {
        this.updateWindowDimensions();

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
        const n = newProps.nodeData.nodes.filter(d => d.type === 'proposal').length;

        const minSankeyNodeHeight = 15;
        const sankeyHeight = n * minSankeyNodeHeight;
        const networkWidth = this.networkDiv.clientWidth;
        const networkHeight = networkWidth;
        const sankeyWidth = this.sankeyDiv.clientWidth;

        this.network
            .width(networkWidth)
            .height(networkHeight)
            .colors(newProps.colors);

        this.sankey
            .width(sankeyWidth)
            .height(sankeyHeight)
            .colors(newProps.colors);

        // Bind data
        d3.select(this.networkDiv)
            .datum(newProps.nodeData)
            .call(this.network);

        d3.select(this.sankeyDiv)
            .style('height', networkHeight + 'px')
            .datum(newProps.nodeData)
            .call(this.sankey);

        this.network.selectNodes(newProps.selectedNodes);
        this.sankey.selectNodes(newProps.selectedNodes);
    }

    render() {
        const height = this.networkDiv ? this.networkDiv.clientWidth : '600px';

        const labelStyle = { marginTop: '15px', marginBottom: '10px' };
        const outerStyle = { display: 'flex', flexWrap: 'wrap' };
        const networkStyle = { width: '600px', flex: '1 0 auto' };
        const sankeyStyle = { width: '600px', flex: '1 0 auto', height: height, overflowY: 'auto' };

        return (
            <>
                <div style={ labelStyle }>
                    <FormLabel >
                        Select legend items to show or hide proposal categories in the network visualization (left) and Sankey diagram (right) | Mouseover visual elements to highlight, and click to select or deselect, based on the corresponding proposals
                    </FormLabel>
                </div>
                <div style={ outerStyle } ref={ div => this.div = div }>
                    <div style={ networkStyle } ref={ div => this.networkDiv = div }></div>
                    <div style={ sankeyStyle } id='sankey' ref={ div => this.sankeyDiv = div }></div>
                </div>
            </>
        );
    }
}

ProposalsNetworkVisualizations.propTypes = {
    nodeData: PropTypes.object.isRequired,
    colors: PropTypes.arrayOf(PropTypes.string).isRequired,
    selectedNodes: PropTypes.arrayOf(PropTypes.object).isRequired,
    onSelectNodes: PropTypes.func,
    onDeselectNodes: PropTypes.func
};

export default ProposalsNetworkVisualizations
