import React from "react"
import { withTheme } from '@material-ui/core/styles'
import Chart from "react-apexcharts"

const barGraph = (props) => {
    const { theme } = props
    const chartOptions = {
        chart: {
            height: 100,
        },
        fill: {
            colors: [theme.palette.primary.main,],
            type: 'gradient',
            gradient: {
                shade: 'light',
                type: "vertical",
                shadeIntensity: 0.26,
                gradientToColors: undefined,
                inverseColors: true,
                opacityFrom: 0.95,
                opacityTo: 0.95,
                stops: [50, 0, 100],
            },
        },
        grid: {
            row: {
                colors: [theme.palette.common.white, theme.palette.primary.main],
                opacity: 0.05,
            }
        },
        plotOptions: {
            bar: {
                horizontal: true,
                columnWidth: '100%',
                endingShape: 'rounded',
            }
        },
        stroke: { width: 0, },
        xaxis: {
            title: {
                text: 'Number of Proposals',
                style: {
                    fontSize: '14px',
                },
            },
            labels: {
                rotate: 0,
                trim: false,
                style: {
                    colors: [],
                    fontSize: '14px',
                    fontFamily: 'sans-serif',
                    cssClass: 'xaxis-label',
                },
            },
            categories: props.proposalsByStage.map(stage => stage.name)
        },
        yaxis: {
            title: {
                text: 'Stage',
                rotate: -90,
            },
            labels: {
                style: {
                    fontSize: '14px',
                    fontFamily: 'sans-serif',
                    cssClass: 'yaxis-label',
                },
            },
        },
        tooltip: {
            enabled: true,
            followCursor: true,
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