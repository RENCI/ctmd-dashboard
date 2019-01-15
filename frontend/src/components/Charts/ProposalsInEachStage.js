import React from "react"
import { withTheme } from '@material-ui/core/styles'
import Chart from "react-apexcharts"

const barGraph = (props) => {
    const { theme } = props
    const chartOptions = {
        fill: {
            colors: [theme.palette.primary.main],
            type: 'gradient',
            gradient: {
                shade: 'light',
                type: "horizontal",
                shadeIntensity: 0.26,
                gradientToColors: undefined,
                inverseColors: true,
                opacityFrom: 0.95,
                opacityTo: 0.95,
                stops: [50, 0, 100],
            },
        },
        plotOptions: {
            bar: { columnWidth: '90%', }
        },
        stroke: { width: 0, },
        xaxis: {
            labels: { rotate: -60, },
            categories: props.proposalsByStage.map(stage => stage.name)
        },
        yaxis: {
            title: { text: 'Number of Proposals', },
        },
        tooltip: {
            enabled: false
        },
    }
    const series = [{
        name: "Proposals",
        data: props.proposalsByStage.map(stage => stage.count),
    }]
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