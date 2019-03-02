import React, { Fragment, useState, useEffect } from 'react';
import axios from 'axios';
import Controls from './ProposalsNetworkControls';
import Visualizations from './ProposalsNetworkVisualizations';
import { CircularLoader } from '../Progress/Progress';

function  ProposalsNetworkContainer(props) {
    const [proposals, setProposals] = useState([]);
    const [filteredProposals, setFilteredProposals] = useState([]);

    async function fetchData() {
        await axios.get(props.apiUrl)
            .then(response => {
                setProposals(response.data);
            })
            .catch(error => {
                console.error('Error:', error)
            });
    }

    useEffect(() => {
      fetchData();
    }, []);

    function handleControlChange(name, event) {
        switch (name) {
            case 'status':
                let status = event.target.value;

                setFilteredProposals(proposals.filter(proposal =>
                    proposal.proposalStatus === status
                ).map(proposal => proposal.proposalID));

                break;
            default:
        }
    }

    return (
        proposals.length > 0 ?
            <Fragment>
                <Controls
                    proposals={ proposals }
                    onChange={ handleControlChange } />
                <Visualizations
                    proposals={ proposals }
                    filteredProposals={ filteredProposals }
                    onSelectProposals={ props.onSelectProposals } />
            </Fragment>
        : <CircularLoader />
    );
}

export default ProposalsNetworkContainer
