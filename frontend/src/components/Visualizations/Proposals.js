import React, { Component } from 'react'
import { InteractiveForceGraph, ForceGraphNode, ForceGraphLink } from 'react-vis-force';
import axios from 'axios'

class proposalsNetwork extends Component {
    state = {
        proposals: null,
    }

    async fetchData() {
        await axios.get(this.props.apiUrl)
            .then(response => {
                this.setState({
                    proposals: response.data,
                })
            })
            .catch(error => {
                console.error(`Error fetching data\nError ${error.response.status}: ${error.response.statusText}`)
            })
    }

    componentWillMount = this.fetchData    

    render() {
        const { proposals } = this.state
        if (!proposals) {
            return null
        } else {
            return (
                <div>
                    <div id="networkDiv">
                        <InteractiveForceGraph
                            simulationOptions={{ height: 300, width: 600 }}
                            onSelectNode={(node) => console.log(node)}
                            highlightDependencies
                        >
                            {
                                proposals.map((proposal, index) => {
                                    return (
                                        <ForceGraphNode
                                            key={ index }
                                            node={{ id: proposal.proposal_id, label: proposal.proposal_id }}
                                            fill="red"
                                        />
                                    )
                                })
                            }
                        </InteractiveForceGraph>
                    </div>
                    <pre>
                        { JSON.stringify(proposals, null, 2) }
                    </pre>
                </div>
            )
        }
    }
}

export default proposalsNetwork