import React, { Component } from 'react'
import axios from 'axios'
import { withStyles } from '@material-ui/core/styles'
import { Table, TableHead, TableBody, TableRow, TableCell } from '@material-ui/core'
import { Paper } from '@material-ui/core';
import Spinner from '../Spinner/Spinner'

const snakeCaseToNormal = (str) => {
    return str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

const styles = theme => ({
    root: {},
    contents: {
        padding: 2 * theme.spacing.unit,
        overflowY: 'scroll',
        maxHeight: 'calc(100vh - 190px)'
    },
})

class ApprovedProposals extends Component {
    state = {
        proposals: [],
        tableHeaders: [],
    }
    
    async fetchData() {
        await axios.get(this.props.apiRoot)
            .then(response => {
                this.setState({
                    proposals: response.data,
                    tableHeaders: Object.keys(response.data[0]),
                })
            })
            .catch(error => {
                console.error(`Error fetching data\nError ${error.response.status}: ${error.response.statusText}`)
            })
    }

    componentDidMount() {
        this.fetchData()
    } 
        
    render() {
        const { classes } = this.props
        return (
            <div className={ classes.root }>
                <Paper className={ classes.contents }>
                    {
                        this.state.proposals.length === 0
                        ? <Spinner/>
                        : <Table>
                                <TableHead>
                                    <TableRow>
                                        {
                                            this.state.tableHeaders.map(header => <TableCell>{ snakeCaseToNormal(header) }</TableCell>)
                                        }
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {
                                        this.state.proposals.sort((p, q) => parseInt(p.proposal_id) > parseInt(q.proposal_id) ? 1 : -1)
                                        .map((prop, index) => (
                                                <TableRow key={ index }>
                                                    {
                                                        this.state.tableHeaders.map(header => (
                                                            <TableCell>
                                                                {
                                                                    (typeof prop[header] === 'object' && prop[header] !== null)
                                                                    ? prop[header].map(item => {
                                                                        return <p>{ item }</p>
                                                                    })
                                                                    : prop[header]
                                                                }
                                                            </TableCell>
                                                        ))
                                                    }
                                                </TableRow>
                                            )
                                        )
                                    }
                                </TableBody>
                            </Table>
                    }
                </Paper>
            </div>
        )
    }
}

export default withStyles(styles)(ApprovedProposals)