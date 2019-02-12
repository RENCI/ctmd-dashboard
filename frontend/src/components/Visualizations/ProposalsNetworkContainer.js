import React, { Fragment, useState, useEffect } from 'react';
import axios from 'axios';
import Controls from './ProposalsNetworkControls';
import Visualizations from './ProposalsNetworkVisualizations';

function  ProposalsNetworkContainer(props) {
    const [proposals, setProposals] = useState([]);
    const [selectedProposals, setSelectedProposals] = useState([]);

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

                setSelectedProposals(proposals.filter(proposal =>
                    proposal.proposal_status === status
                ).map(proposal => proposal.proposal_id));

                break;
            default:
        }
    }

    return (
        <Fragment>
            <Controls
                proposals={ proposals }
                onChange={ handleControlChange } />
            <Visualizations
                proposals={ proposals }
                selectedProposals={ selectedProposals } />
        </Fragment>
    );
}

export default ProposalsNetworkContainer
