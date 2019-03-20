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
            windowHeight: 0
        };

        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
        this.highlightNodes = this.highlightNodes.bind(this);

        this.network = proposalsNetwork()
            //.on("highlightNodes", this.highlightNodes)
            //.on("selectNodes", this.props.onSelectNodes)
            //.on("deselectNodes", this.props.onDeselectNodes);

        this.sankey = proposalsSankey()
            .on("highlightNodes", this.highlightNodes)
            .on("selectNodes", this.props.onSelectNodes)
            .on("deselectNodes", this.props.onDeselectNodes);
    }

    updateWindowDimensions() {
        // Should cause a re-render if the window size has changed
        this.setState({
            windowWidth: window.width,
            windowHeight: window.height
        });
    }

    highlightNodes(nodes) {
        //this.network.highlightNodes(nodes);
        this.sankey.highlightNodes(nodes);
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
        const n = newProps.nodeData.nodes.filter(d => d.type === 'proposal').length;

        const minSankeyNodeHeight = 10;
        const sankeyHeight = n * minSankeyNodeHeight;
        const networkWidth = this.networkDiv.clientWidth;
        const networkHeight = networkWidth;
        const sankeyWidth = this.sankeyDiv.clientWidth;

        this.network
            .width(networkWidth)
            .height(networkHeight);

        this.sankey
            .width(sankeyWidth)
            .height(sankeyHeight);

        if (!oldProps || newProps.nodeData !== oldProps.nodeData) {
            // Bind new data
            //d3.select(this.networkDiv)
              //  .datum(newProps.nodes)
                //.call(this.network);

            d3.select(this.sankeyDiv)
                .datum(newProps.nodeData)
                .call(this.sankey);
        }

        //this.network.selectNodes(newProps.selectedNodes);
        this.sankey.selectNodes(newProps.selectedNodes);
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
    nodeData: PropTypes.object.isRequired,
    selectedNodes: PropTypes.arrayOf(PropTypes.object).isRequired,
    onSelectNodes: PropTypes.func,
    onDeselectNodes: PropTypes.func
};

export default ProposalsNetworkVisualizations
