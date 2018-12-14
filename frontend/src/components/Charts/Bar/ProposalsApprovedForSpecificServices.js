import React from "react";
import { withTheme } from '@material-ui/core/styles'
import Chart from "react-apexcharts";
import ProposalsApprovedForSpecificServices from '../../../data/ProposalsApprovedForSpecificServices'

const keys = Object.keys(ProposalsApprovedForSpecificServices)
const categories = keys.map( (key) => ProposalsApprovedForSpecificServices[key].name )
const data = keys.map( (key) => ProposalsApprovedForSpecificServices[key].count )

const barGraph = (props) => {
    const { theme } = props
    const options = {
        fill: {
          colors: [theme.palette.primary.main,]
        },
        plotOptions: {
            bar: {
                columnWidth: '90%',
                endingShape: 'rounded',
            }
        },
        stroke: {
            width: 0,
        },
        xaxis: {
            labels: {
                rotate: -45,
            },
            categories: categories,
        },
        yaxis: {
            title: {
                text: 'Number of Proposals',
            },
        },
    }
    const series = [{
        name: "Proposals",
        data: data,
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