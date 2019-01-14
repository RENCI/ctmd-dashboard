import React, { Component } from 'react'
import axios from 'axios'

import Heading from '../../components/Typography/Heading'
import Paragraph from '../../components/Typography/Paragraph'

import ProposalsInEachStage from '../../components/Charts/ProposalsInEachStage'

const proposalsUrl = process.env.NODE_ENV === 'production' ? 'https://pmd.renci.org/api/proposals' : 'http://localhost:3030/proposals'
const stagesUrl = process.env.NODE_ENV === 'production' ? 'https://pmd.renci.org/api/stages' : 'http://localhost:3030/stages'

const camelCase = str => {
    let string = str.toLowerCase().replace(/[^A-Za-z0-9]/g, ' ').split(' ')
        .reduce((result, word) => result + capitalize(word.toLowerCase()))
    return string.charAt(0).toLowerCase() + string.slice(1)
}
const capitalize = str => str.charAt(0).toUpperCase() + str.toLowerCase().slice(1)

class proposalsByStage extends Component {
    state = {
        stages: [],
    }

    bucketProposals() {
        let stages = []
        this.state.proposals.forEach(proposal => {
            if (camelCase(proposal.proposal_status) in stages) {
                stages[camelCase(proposal.proposal_status)].count += 1
            } else {
                stages[camelCase(proposal.proposal_status)] = {
                    name: proposal.proposal_status,
                    count: 0,
                }
            }
        })
        this.setState({ stages: stages })
    }

    componentDidMount() {
        const proposalsPromise = axios.get(proposalsUrl)
        const stagesPromise = axios.get(stagesUrl)
        Promise.all([proposalsPromise, stagesPromise])
            .then(data => {
                console.log(data)
            })
            .catch(error => {
                console.error(`Error fetching data\nError ${error.response.status}: ${error.response.statusText}`)
            })
    }

    render() {
        return (
            <div>
                <Heading>
                    Proposals by Stage
                </Heading>

                {
                    this.state.stages.length > 0
                        ? <ProposalsInEachStage stages={ this.state.stages }/>
                        : ('not yet')
                }
            </div>
        )
    }
}

export default proposalsByStage