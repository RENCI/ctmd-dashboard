import React from "react"
import { withTheme } from '@material-ui/core/styles'
import Chart from "react-apexcharts"

const barGraph = (props) => {
    const { theme } = props
    const options = {
        fill: {
          colors: [theme.palette.primary.main,]
        },
        title: {
            text: 'A Bar Chart'
        },
        xaxis: {
            categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998],
        },
    }
    const series = [{
        name: "Data A",
        data: [60, 40, 70, 91, 45, 50, 49, 60],
    }]

    return (
        <Chart
            type="bar"
            options={ options }
            series={ series }
            width="100%"
        />
    )
}

export default withTheme()(barGraph)