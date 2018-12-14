import React from "react"
import { withTheme } from '@material-ui/core/styles'
import Chart from "react-apexcharts"



const areaChart = (props) => {
    const { theme } = props
    const options = {
        fill: {
          colors: [theme.palette.primary.main,]
        },
        chart: {
            height: 350,
            type: 'area',
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth'
        },
        xaxis: {
            type: 'datetime',
            categories: ["2018-09-19T00:00:00", "2018-09-19T01:30:00", "2018-09-19T02:30:00", "2018-09-19T03:30:00", "2018-09-19T04:30:00", "2018-09-19T05:30:00", "2018-09-19T06:30:00"],                
        },
        tooltip: {
            x: {
                format: 'dd/MM/yy HH:mm'
            },
        }
    }

    const series = [{
        name: 'series-1',
        data: [31, 40, 28, 51, 42, 109, 100]
    }, {
        name: 'series-2',
        data: [11, 32, 45, 32, 34, 52, 41]
    }]

    return (
        <Chart
            options={ options }
            series={ series }
            width="100%"
        />
    )
}

export default withTheme()(areaChart)