import React, { useContext } from 'react'
import MaterialTable from 'material-table'

export const LookupTable = ({ title, data }) => {
    const now = new Date()
    return (
        <MaterialTable
            columns={ [
                { title: 'ID', field: 'id', },
                { title: 'Name', field: 'name', },
            ] }
            data={ data }
            options={{
                title: title,
                columnsButton: true,
                exportButton: true,
                filtering: true,
                grouping: true,
                pageSize: 25,
                pageSizeOptions: [15, 25, 50, 100, 200],
                exportFileName: `${ title }__${ now.toISOString() }`,
            }}
        />
    )
}
