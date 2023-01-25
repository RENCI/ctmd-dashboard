import React from 'react'
import MaterialTable from 'material-table'
import {IconButton} from "@material-ui/core";
import axios from "axios";
import api from "../../Api";
import RemoveCircleIcon from "@material-ui/icons/RemoveCircle";


export const LookupTable = ({ title, data }) => {
    const now = new Date()
    return (
        <div>
            <div>HHH100</div>
        <MaterialTable
            columns={ [
                { title: 'ID', field: 'id', },
                { title: 'Name', field: 'name', },
                { title: 'Action', render: RemoveBtn, columnVisibility: false, },
            ] }
            data={ data }
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
        </div>
    )
}

export const RemoveBtn = row => {
    return(
        <IconButton variant="outlined"
                    color="secondary"
                    title="remove"
                    onClick={function () {
                        if (window.confirm("Do you really want to remove this item?")) {

                            axios.delete(api.ctsas, {data: {ctsaId: row.id }})
                                .then(data => {
                                    if (data.data === "OK")
                                        window.alert("Item has been removed. Refresh the page to see the change.")
                                    else
                                        window.alert("Item cannot be removed.")
                                })

                                .catch(error => console.error(error))
                        }

                    }}>
            <RemoveCircleIcon htmlColor="red"></RemoveCircleIcon>
        </IconButton>
    )
}