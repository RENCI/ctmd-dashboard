import React from "react"
import { withTheme } from '@material-ui/core/styles'
import Chart from "react-apexcharts"

const barGraph = (props) => {
    const { theme } = props
    const chartOptions = {
        fill: {
            colors: [theme.palette.primary.main,]
        },
        plotOptions: {
            bar: {
                columnWidth: '90%',
            }
        },
        stroke: {
            width: 0,
        },
        xaxis: {
            labels: {
                rotate: -45,
            },
            categories: []
        },
        yaxis: {
            title: {
                text: 'Number of Proposals',
            },
        },
    }
    const series = [{
        name: "Proposals",
        data: props.proposalsByStage,
    }]
    console.log(props.stages)
    return (
        <Chart
            type="bar"
            options={ chartOptions }
            series={ series }
            width="100%"
        />
    )
}

export default withTheme()(barGraph)