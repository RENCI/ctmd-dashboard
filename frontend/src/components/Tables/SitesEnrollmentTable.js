import React from 'react'
import MaterialTable from 'material-table'
import { EnrollmentBar } from '../Widgets/EnrollmentBar'
import {IconButton} from "@material-ui/core";
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';
import axios from "axios";
import api from "../../Api";

export const SitesEnrollmentTable = props => {
    const title = 'SitesEnrollment'
    const now = new Date()

    const barHeight = 18
    const barWidth = 200

    const barColor = "#8da0cb"
    const barBackground = "#f3f5fa"

    const maxExpected = props.data.reduce((p, c) => {
        return !c.expected ? p : Math.max(p, c.expected);
    }, 0)

    const bar = row => {
        return (
            !('enrolled' in row) ? null :
            <EnrollmentBar
                data={ row }
                enrolledKey='enrolled'
                expectedKey='expected'
                maxValue={ maxExpected }
                height={ barHeight }
                width={ barWidth }
                color={ barColor }
                background={ barBackground } />
        )
    }

    const removeBtn = row => {
        return(
            <IconButton variant="outlined"
                    color="secondary"
                    title="remove"
                    onClick={function () {
                        if (window.confirm("Do you really want to remove this item?")) {

                            axios.delete(api.sites, {data: {siteId: row.id, proposalID: row.proposalID}})
                                    .then(data => window.alert("Item has been removed. Refresh the page to see the change."))
                                    .catch(error => console.error(error))
                        }

                    }}>
                    <RemoveCircleIcon htmlColor="red"></RemoveCircleIcon>
            </IconButton>
        )
    }
    return (
        <MaterialTable
            columns={ [
                { title: 'ID', field: 'id', },
                { title: 'Name', field: 'name', },
                { title: 'Study', field: 'studyName' },
                { title: 'Enrollment', render: bar },
                { title: 'Enrolled', field: 'enrolled', type: 'numeric'},
                { title: 'Expected', field: 'expected', type: 'numeric' },
                { title: 'Percent Enrolled (%)', field: 'percentEnrolled', type: 'numeric' },
                { title: 'CTSA ID', field: 'ctsaId'},
                { title: 'Edit', hidden: false, render: removeBtn },

            ] }
            data={ props.data }
            options={{
                showTitle: false,
                columnsButton: true,
                exportButton: true,
                filtering: true,
                grouping: true,
                paging: false,
                // pageSize: 25,
                // pageSizeOptions: [15, 25, 50, 100, 200],
                exportFileName: `${ title }__${ now.toISOString() }`,
            }}

        />
    )
}
