import React, { Component } from 'react'
import classnames from 'classnames'
import { withStyles } from '@material-ui/core/styles'
import { Table, TableHead, TableBody, TableRow, TableCell } from '@material-ui/core'
import { Tooltip } from '@material-ui/core'
import axios from 'axios'

const snakeCaseToNormal = (str) => {
    return str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

const styles = theme => ({
    root: { },
    bodyCell: {
        borderRadius: '10px',
        padding: theme.spacing.unit,
    },
    bodyCellFilled: {
        backgroundColor: theme.palette.primary.main,
        transition: 'background-color 250ms',
        '&:hover': {
            backgroundColor: theme.palette.secondary.main,
        }
    },
})

class ProposalsMatrix extends Component {
    state = {
        proposals: []
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

    componentDidMount() {
        this.fetchData()
    } 
    
    render() {
        const { proposals } = this.state
        const { classes } = this.props
        return (
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>&nbsp;</TableCell>
                        {
                            [...Array(8).keys()].map(val => {
                                return (
                                    <TableCell>{ val + 1}</TableCell>
                                )
                            })
                        }
                    </TableRow>
                </TableHead>
                <TableBody>
                    {
                        proposals.map(proposal => {
                            return (
                                <TableRow>
                                    <TableCell>
                                        { proposal.proposal_id }
                                    </TableCell>
                                    {
                                        [...Array(8).keys()].map(val => {
                                            return (proposal.services_approved.indexOf(`services_approved___${val + 1}`) >= 0)
                                            ? <Tooltip title={ `services_approved___${val + 1}` } placement="top">
                                                <TableCell className={ classnames(classes.bodyCell, classes.bodyCellFilled) }></TableCell>
                                            </Tooltip>
                                            : <TableCell className={ classnames(classes.bodyCell) }></TableCell>
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