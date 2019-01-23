import React, { Component } from 'react'
import axios from 'axios'
import { withStyles } from '@material-ui/core/styles'
import { Table, TableHead, TableBody, TableRow, TableCell } from '@material-ui/core'
import { Paper } from '@material-ui/core';

const styles = theme => ({
    root: {},
    contents: {
        padding: 2 * theme.spacing.unit,
        overflowY: 'scroll',
        maxHeight: 'calc(100vh - 190px)'
    },
})

class ProposalsTable extends Component {
    render() {
        const { classes, proposals } = this.props
        const attributes = [
            { key: 'proposal_id', name: 'Proposal ID' },
            { key: 'pi_name', name: 'PI' },
            { key: 'proposal_status', name: 'Proposal Status' },
            { key: 'tic_name', name: 'TIC' },
            { key: 'org_name', name: 'Organization' },
            { key: 'submittion_date', name: 'Submission Date' },
        ]
        return (
            <div className={ classes.root }>
                <Paper className={ classes.contents }>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {
                                    attributes.map(attr => {
                                        return <TableCell>{ attr.name }</TableCell>
                                    })
                                }
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                proposals.map(proposal => {
                                    return (
                                        <TableRow>
                                            { attributes.map(attr => <TableCell>{ proposal[attr.key] }</TableCell>) }
                                        </TableRow>
                                    )
                                })
                            }
                        </TableBody>
                    </Table>
                </Paper>
            </div>
        )
    }
}

export default withStyles(styles)(ProposalsTable)