import React from "react"
import { withTheme } from '@material-ui/core/styles'
import Chart from "react-apexcharts"



const lineGraph = (props) => {
    const { theme } = props

    const options = {
        chart: {
            height: 150,
            type: 'line',
            shadow: {
                enabled: true,
                color: '#000',
                top: 18,
                left: 7,
                blur: 10,
                opacity: 1
            },
            zoom: {
                enabled: false
            }
        },
        fill: {
            colors: [theme.palette.secondary.main, theme.palette.tertiary.sand, theme.palette.primary.main, theme.palette.tertiary.rhino,],
        },
        title: {
            text: ''
        },
        xaxis: {
            categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998]
        }
    }

    const series = [
        {
            name: "series-1",
            data: [30, 40, 45, 50, 49, 60, 70, 91],
        },
        {
            name: "series-2",
            data: [15, 10, 15, 0, 46, 90, 60, 19],
            colors: [theme.palette.secondary.main, theme.palette.tertiary.sand, '#9C27B0']
        }
    ]

    return (
        <Chart
            options={ options }
            series={ series }
            type="line"
            width="100%"
        />
    )
}

export default withTheme()(lineGraph)