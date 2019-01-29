import React, { Component } from 'react';
import axios from 'axios';
import * as d3 from 'd3';
import proposalsNetwork from './proposalsNetwork';
import proposalsSankey from './proposalsSankey';

class ProposalsNetworkContainer extends Component {
    state = {
        proposals: null,
    };

    network = proposalsNetwork();
    sankey = proposalsSankey();

    async fetchData() {
        await axios.get(this.props.apiUrl)
            .then(response => {
                this.setState({
                    proposals: response.data,
                });
            })
            .catch(error => {
                console.error(`Error fetching data\nError ${error.response.status}: ${error.response.statusText}`)
            });
    }

    componentWillMount = this.fetchData;

    shouldComponentUpdate(props, state) {
        if (state.proposals) {
            this.drawVisualization(props, state);
        }

        return false;
    }

    drawVisualization(props, state) {
        this.network
            .width(800)
            .height(800);

        this.sankey
            .width(800)
            .height(1000);

        d3.select(this.networkDiv)
            .datum(state.proposals)
            .call(this.network);

        d3.select(this.sankeyDiv)
            .datum(state.proposals)
            .call(this.sankey);
    }

    render() {
        let outerStyle = { display: "flex", flexWrap: "wrap" };
        let innerStyle = { flex: "1 0 auto" };

        return (
            <div style={outerStyle}>
                <div style={innerStyle} ref={div => this.networkDiv = div}></div>
                <div style={innerStyle} ref={div => this.sankeyDiv = div}></div>
            </div>
        );
    }
}

export default ProposalsNetworkContainer;
