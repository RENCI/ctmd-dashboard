import React from 'react'
import MaterialTable, { MTableToolbar } from 'material-table'
import { Paper } from '@material-ui/core'

const ProposalsTable = (props) => {
    const { proposals } = props
    return (
        <MaterialTable
            components={{ }}
            columns={ [
                { title: 'Proposal ID', field: 'proposal_id', },
                { title: 'Proposal Name', field: 'short_name', },
                { title: 'PI', field: 'pi_name', },
                { title: 'Proposal Status', field: 'proposal_status', },
                { title: 'Therapeutic Area', field: 'therapeutic_area', },
                { title: 'TIC', field: 'tic_name', },
                { title: 'Organization', field: 'org_name', },
                { title: 'Submission Date', field: 'prop_submit', type: 'datetime', render: ({submission_date}) => <span>{ submission_date }</span>},
            ] }
            data={ proposals }
            options={{
                paging: props.paging,
                columnsButton: true,
                exportButton: true,
                filtering: true,
                grouping: true,
                pageSize: 15,
                pageSizeOptions: [15, 25, 50],
            }}
            title=""
        />
    )
}

export default ProposalsTable