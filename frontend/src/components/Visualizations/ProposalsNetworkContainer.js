import React, { Component } from 'react';
import axios from 'axios';
import * as d3 from 'd3';
import proposalsNetwork from './proposalsNetwork';

class ProposalsNetworkContainer extends Component {
    state = {
        proposals: null,
    };

    network = proposalsNetwork();

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
            .width(1000)
            .height(1000);

        d3.select(this.div)
            .datum(state.proposals)
            .call(this.network);
    }

    render() {
        return <div ref={div => this.div = div}></div>;
    }
}

export default ProposalsNetworkContainer;
