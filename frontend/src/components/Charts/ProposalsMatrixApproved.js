import React, { Component } from 'react'
import classnames from 'classnames'
import { withStyles } from '@material-ui/core/styles'
import { Table, TableHead, TableBody, TableRow, TableCell } from '@material-ui/core'
import { Tooltip } from '@material-ui/core'
import axios from 'axios'

const styles = theme => ({
    root: { },
    bodyRow: {
        transition: 'background-color 250ms',
        '&:hover': {
            backgroundColor: theme.palette.grey[200],
            '& $bodyCellFilled': {
                backgroundColor: theme.palette.primary.main,
                '&:hover': {
                    backgroundColor: theme.palette.secondary.main,
                }
            }
        }
    },
    bodyCell: {
        padding: theme.spacing.unit,
        backgroundColor: 'transparent',
    },
    bodyCellFilled: {
        backgroundColor: theme.palette.primary.light,
        transition: 'background-color 250ms',
    },
})

class ProposalsMatrix extends Component {
    state = {
        proposals: [],
        services: [],
    }

    async fetchProposals() {
        await axios.get(this.props.proposalsUrl)
            .then(response => {
                this.setState({
                    proposals: response.data,
                })
            })
            .catch(error => {
                console.error(`Error fetching data\nError ${error.response.status}: ${error.response.statusText}`)
            })
    }

    async fetchServices() {
        await axios.get(this.props.servicesUrl)
            .then(response => {
                this.setState({
                    services: response.data,
                })
            })
            .catch(error => {
                console.error(`Error fetching data\nError ${error.response.status}: ${error.response.statusText}`)
            })
    }

    componentDidMount() {
        this.fetchProposals()
        this.fetchServices()
    } 
    
    render() {
        const { proposals, services } = this.state
        const { classes } = this.props
        return (
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell padding="dense">&nbsp;</TableCell>
                        {
                            services.map(service => <TableCell key={ service.index } padding="dense">{ service.description }</TableCell>)
                        }
                    </TableRow>
                </TableHead>
                <TableBody>
                    {
                        proposals.map(proposal => {
                            return (
                                <TableRow key={ proposal.proposal_id } className={ classes.bodyRow }>
                                    <TableCell padding="dense">{ proposal.proposal_id }</TableCell>
                                    {
                                        services.map(service => {
                                            return (proposal.services_approved.indexOf(service.id) >= 0)
                                            ? <Tooltip title={
                                                    <div style={{ textAlign: 'center' }}>
                                                        <div><strong>Proposal { proposal.proposal_id }</strong></div>
                                                        <div>{ service.description }</div>
                                                        <div>{ proposal.meeting_date }</div>
                                                    </div>
                                                } key={ `${ proposal.id }-${ service.id }-tooltip` } placement="top">
                                                <TableCell padding="dense" className={ classnames(classes.bodyCell, classes.bodyCellFilled) }/>
                                            </Tooltip>
                                            : <TableCell key={ `${ proposal.id }-${ service.id }` } padding="dense" className={ classes.bodyCell }/>
                                        })
                                    }
                                </TableRow>
                            )
                        })
                    }
                </TableBody>
            </Table>
        )
    }
}

export default withStyles(styles)(ProposalsMatrix)