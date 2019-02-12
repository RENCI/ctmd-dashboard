import React, { Component, Fragment } from 'react';
import axios from 'axios';
import Controls from './ProposalsNetworkControls';
import Visualizations from './ProposalsNetworkVisualizations';

class ProposalsNetworkContainer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            proposals: [],
            selectedProposals: []
        };

        this.handleControlChange = this.handleControlChange.bind(this);
    }

    handleControlChange(name, event) {
        switch (name) {
            case 'status':
                let status = event.target.value;

                this.setState({
                      selectedProposals: this.state.proposals.filter(proposal =>
                          proposal.proposal_status === status
                      ).map(proposal => proposal.proposal_id)
                });

                break;
            default:
        }
    }

    async fetchData() {
        await axios.get(this.props.apiUrl)
            .then(response => {
                this.setState({
                    proposals: response.data
                });
            })
            .catch(error => {
                console.error('Error:', error)
            });
    }

    componentWillMount = this.fetchData;

    render() {
        return (
            <Fragment>
                <Controls
                    proposals={ this.state.proposals }
                    onChange={ this.handleControlChange } />
                <Visualizations
                    proposals={ this.state.proposals }
                    selectedProposals={ this.state.selectedProposals } />
            </Fragment>
        );
    }
}

export default ProposalsNetworkContainer
