import React from "react"
import { withTheme } from '@material-ui/core/styles'
import Chart from "react-apexcharts"

function generateData(baseval, count, yrange) {
    var i = 0
    var series = []
    while (i < count) {
        var x = Math.floor(Math.random() * (750 - 1 + 1)) + 1
        var y = Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min
        var z = Math.floor(Math.random() * (75 - 15 + 1)) + 15

        series.push([x, y, z])
        baseval += 86400000
        i++
    }
    return series
}

const bubbleChart = (props) => {
    const { theme } = props

    const options = {
        chart: {
            height: 350,
            type: 'bubble',
        },
        legend: {
            onItemHover: {
                highlightDataSeries: true
            },
        },
        dataLabels: {
            enabled: false
        },
        fill: {
            colors: [
                theme.palette.secondary.main,
                theme.palette.primary.main,
                theme.palette.tertiary.sand,
                theme.palette.tertiary.rhino,
            ],
            opacity: 0.8,
            gradient: {
                enabled: false
            }
        },
        title: {
            text: ''
        },
        xaxis: {
            tickAmount: 12,
            type: 'category',
        },
        yaxis: {
            max: 70
        }
    }

    const series = [{
            name: 'Bubble1',
            data: generateData(new Date('11 Feb 2017 GMT').getTime(), 20, {
                min: 10,
                max: 60
            })
        },
        {
            name: 'Bubble2',
            data: generateData(new Date('11 Feb 2017 GMT').getTime(), 20, {
                min: 10,
                max: 60
            })
        },
        {
            name: 'Bubble3',
            data: generateData(new Date('11 Feb 2017 GMT').getTime(), 20, {
                min: 10,
                max: 60
            })
        },
        {
            name: 'Bubble4',
            data: generateData(new Date('11 Feb 2017 GMT').getTime(), 20, {
                min: 10,
                max: 60
            })
        }
    ]

    return (
        <Chart
            options={ options }
            series={ series }
            type="bubble"
            width="100%"
        />
    )
}

export default withTheme()(bubbleChart)