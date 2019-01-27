import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles'
import MaterialTable from 'material-table'

const styles = (theme) => ({
    table: {
        padding: 2 * theme.spacing.unit,
        overflowY: 'scroll',
        maxHeight: 'calc(100vh - 190px)'
    },
})

class ProposalsTable extends Component {
    render() {
        const { classes, proposals } = this.props
        return (
            <MaterialTable
                className={ classes.table }
                columns={ [
                    { title: 'Proposal ID', field: 'proposal_id', type: 'numeric', },
                    { title: 'PI', field: 'pi_name', },
                    { title: 'Proposal Status', field: 'proposal_status', },
                    { title: 'TIC', field: 'tic_name', },
                    { title: 'Organization', field: 'org_name', },
                    { title: 'Submission Date', field: 'prop_submit', type: 'datetime', render: ({submission_date}) => <span>{ submission_date }</span>},
                ] }
                data={ proposals }
                options={{
                    columnsButton: true,
                    exportButton: true,
                    pageSize: 15,
                    pageSizeOptions: [15, 25, 50],
                    filtering: true,
                }}
                title=""
            />
        )
    }
}

export default withStyles(styles)(ProposalsTable)