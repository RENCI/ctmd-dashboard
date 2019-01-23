import React, { Component } from 'react'
import axios from 'axios'
import Spinner from '../../components/Spinner/Spinner'
import Heading from '../../components/Typography/Heading'

import ProposalsTable from '../../components/Charts/ProposalsTable'

const proposalsUrl = process.env.NODE_ENV === 'production' ? 'https://pmd.renci.org/api/proposals' : 'http://localhost:3030/proposals'

class proposalsTable extends Component {
    state = {
        proposals: [],
    }

    componentDidMount() {
        axios.get(proposalsUrl)
            .then((response) => {
                this.setState({
                    proposals: response.data,
                })
            })
            .catch(error => {
                console.error('Error:', error)
            })
    }

    render() {
        const { proposals } = this.state
        return (
            <div>
                <Heading>Approved Proposals</Heading>

                <ProposalsTable proposals={ proposals }/>
                                
            </div>
        )
    }
}

export default proposalsTable