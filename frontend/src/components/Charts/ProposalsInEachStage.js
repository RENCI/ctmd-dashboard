import React, { Component } from "react"
import axios from 'axios'
import { withTheme } from '@material-ui/core/styles'
import Chart from "react-apexcharts"
import ProposalsInEachStage from '../../data/ProposalsInEachStage'

const keys = Object.keys(ProposalsInEachStage)
const categories = keys.map( (key) => ProposalsInEachStage[key].name )
const data = keys.map( (key) => ProposalsInEachStage[key].count )

class BarGraph extends Component {
    state = {
        proposals: [],
        stages: [],
    }

    async fetchProposals() {
        await axios.get(this.props.proposalsUrl)
            .then(response => {
                this.setState({ proposals: response.data, })
            })
            .catch(error => {
                console.error(`Error fetching data\nError ${error.response.status}: ${error.response.statusText}`)
            })
    }

    async fetchStages() {
        await axios.get(this.props.stagesUrl)
            .then(response => {
                this.setState({ stages: response.data, })
            })
            .catch(error => {
                console.error(`Error fetching data\nError ${error.response.status}: ${error.response.statusText}`)
            })
    }

    componentDidMount() {
        this.fetchProposals()
        this.fetchStages()
    }

    render() {
        const { theme } = this.props
        const options = {
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
}

export default withTheme()(BarGraph)