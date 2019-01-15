import React, { Component } from 'react'
import axios from 'axios'

import Heading from '../../components/Typography/Heading'

import ProposalsInEachStage from '../../components/Charts/ProposalsInEachStage'

const stagesUrl = process.env.NODE_ENV === 'production'
    ? 'https://pmd.renci.org/api/proposals/by-stage'
    : 'http://localhost:3030/proposals/by-stage'

class proposalsByStage extends Component {
    state = {
        stages: [],
    }
    
    async fetchProposals() {
        await axios.get(stagesUrl)
            .then(response => {
                this.setState({ stages: response.data, })
            })
            .catch(error => {
                console.error(`Error fetching data\nError ${error.response.status}: ${error.response.statusText}`)
            })
    }

    componentDidMount = this.fetchProposals

    render() {
        const { stages } = this.state
        return (
            <div>
                <Heading>
                    Proposals by Stage
                </Heading>
                
                {
                    stages.length > 0
                    ? <ProposalsInEachStage proposalsByStage={ this.state.stages }/>
                    : null
                }
            </div>
        )
    }
}

export default proposalsByStage