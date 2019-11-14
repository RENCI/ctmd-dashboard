import React from 'react'
import MaterialTable from 'material-table'
import { ResponsiveBar } from '@nivo/bar'

export const SitesEnrollmentTable = props => {
    const title = 'SitesEnrollment'
    const now = new Date()

    const barHeight = 18
    const barWidth = 200

    const barColor = "#8da0cb"
    const barBackground = "#f3f5fa"

    const maxValue = props.data.reduce((p, c) => {
      return !c.expected ? p : Math.max(p, c.expected);
    }, 0)

    const barTooltip = row => {
        return (
            <div style={{ width: 100 }}>
                <p>{row.data.enrolled + ' of ' + row.data.expected + ' enrolled: '}</p>
                <p>{row.data.percentEnrolled + '%'}</p>
            </div>
        )
    }

    const bar = row => {
        return !('enrolled' in row) ? null :
            <div style={{
                    height: barHeight,
                    width: (row.expected / maxValue) * barWidth,
                    border: '2px solid ' + barColor,
                    background: barBackground
                }}
            >
                <ResponsiveBar
                    data={ [row] }
                    minValue={ 0 }
                    maxValue={ row.expected }
                    keys={ ['enrolled'] }
                    colors={ [barColor] }
                    colorBy='id'
                    layout='horizontal'
                    animate={ false }
                    padding={ 0 }
                    enableGridY={ false }
                    tooltip={ barTooltip }
                />
            </div>
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
                { title: 'Percent Enrolled (%)', field: 'percentEnrolled', type: 'numeric' }
            ] }
            data={ props.data }
            options={{
                showTitle: false,
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
