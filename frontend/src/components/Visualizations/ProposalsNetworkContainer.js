import React, { Component } from 'react';
import axios from 'axios';
import * as d3 from 'd3';
import proposalsNetwork from './proposalsNetwork';
import proposalsSankey from './proposalsSankey';

class ProposalsNetworkContainer extends Component {
    constructor(props) {
        super(props)
        this.state = {
            width: 0,
            height: 0,
            proposals: null,
        }
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this)
    }

    network = proposalsNetwork();
    sankey = proposalsSankey();

    updateWindowDimensions() {
        this.setState({ width: window.innerWidth, height: window.innerHeight })
    }

    async fetchData() {
        await axios.get(this.props.apiUrl)
            .then(response => {
                this.setState({
                    proposals: response.data,
                });
            })
            .catch(error => {
                console.error('Error:', error)
            });
    }

    componentWillMount = this.fetchData;
    
    componentDidMount() {
        this.updateWindowDimensions()
        window.addEventListener('resize', this.updateWindowDimensions)
    }

    shouldComponentUpdate(props, state) {
        if (state.proposals) {
            this.drawVisualization(props, state);
        }
        return false;
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
    }
    
    drawVisualization(props, state) {
        const minSankeyHeight = 1000;
        // const networkWidth = this.networkDiv.clientWidth;
        const networkWidth = this.state.width - 240;
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
    }

    render() {
        let outerStyle = { display: "flex", flexWrap: "wrap", width: "100%"};
        let innerStyle = { width: `${ this.state.width - 240}px`, flex: "1 1 auto" };
        
        return (
            <div style={outerStyle}>
                <div style={innerStyle} ref={div => this.networkDiv = div}></div>
                <div style={innerStyle} ref={div => this.sankeyDiv = div}></div>
            </div>
        );
    }
}

export default ProposalsNetworkContainer;
