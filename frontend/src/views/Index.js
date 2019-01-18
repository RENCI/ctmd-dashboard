import React, { Component } from 'react'
import axios from 'axios'
import { withStyles, withTheme } from '@material-ui/core/styles'
import { Grid, Card, CardContent } from '@material-ui/core'
import ApexChart from 'react-apexcharts'

import Heading from '../components/Typography/Heading'
import Spinner from '../components/Spinner/Spinner'

const apiRoot = (process.env.NODE_ENV === 'production') ? 'https://pmd.renci.org/api/' : 'http://localhost:3030/'
const apiUrl = {
    proposalsByTic: apiRoot + 'proposals/by-tic',
    proposalsByStage: apiRoot + 'proposals/by-stage',
}

const styles = (theme) => ({
    root: {
        // ...theme.mixins.debug
    },
    container: {
        margin: 4 * theme.spacing.unit,
        display: 'block',
        '&:last-child': { marginRight: 0, },
    },
    item: {
    },
    card: {
        marginRight: 2 * theme.spacing.unit,
        marginBottom: 2 * theme.spacing.unit,
        backgroundColor: theme.palette.grey[100],
    },
    chart: {
        backgroundColor: theme.palette.extended.copper,
        height: '200px',
    }
})

class HomePage extends Component {
    state = {
        proposalsByTic: [],
        proposalsByStage: [],
    }

    barChartOptions = (categories = []) => ({
        plotOptions: {
            bar: {
                horizontal: true,
                barHeight: '90%',
                dataLabels: { position: 'top', },
            }
        },
        colors: [
            this.props.theme.palette.primary.main,
            this.props.theme.palette.extended.persimmon,
        ],
        dataLabels: {
            offsetX: 0,
            textAnchor: 'end',
            style: {
                fontSize: '12px',
                colors: ['#304758'],
            },
        },  
        stroke: { width: 0, },
        tooltip: {
            theme: 'light',
            followCursor: true,
            x: { show: true },
            y: { show: true, title: { formatter: () => '' }, },
        },
        xaxis: {
            labels: { show: false },
            categories: categories,
            axisTicks: { show: false, },
            axisBorder: { show: false },
        },
        yaxis: {
            labels: { show: true },
        },
        grid: { show: false },
    })

    pieChartOptions = (labels = []) => ({
        plotOptions: {
            pie: { expandOnClick: false }, // Why doesn't this work?
        },
        labels: labels,
        theme: {
            monochrome: { enabled: true }
        },
        title: {
            show: false,
            text: '',
        },
        responsive: [{
            breakpoint: 480,
            options: {
                chart: { width: 200 },
                legend: { position: 'bottom' }
            }
        }],
        legend: {
            show: false,
        },
    })

    componentDidMount() {
        const promises = [
            axios.get(apiUrl.proposalsByTic),
            axios.get(apiUrl.proposalsByStage),
        ]
        Promise.all(promises)
            .then((response) => {
                this.setState({
                    proposalsByTic: response[0].data,
                    proposalsByStage: response[1].data,
                })
            })
            .catch(error => {
                console.log('Error', error)
            })
    }

    render() {
        const { classes, theme } = this.props
        const { proposalsByTic, proposalsByStage } = this.state
        return (
            <div className={ classes.root }>
                <Heading>Dashboard Home</Heading>
                
                <br/>

                <Grid container>
                    <Grid item sm={ 12 } md={ 6 } className={ classes.item }>
                        <Card className={ classes.card } square={ true }>
                            <CardContent>
                                <Heading>Proposals By TIC</Heading>
                            </CardContent>
                            <CardContent>
                                {
                                    (proposalsByTic) ? (
                                        <ApexChart type="bar" height="300"
                                            options={ this.barChartOptions(proposalsByTic.map(tic => tic.name.slice(0, -4))) }
                                            series={ [{
                                                name: "Proposals",
                                                data: proposalsByTic.map(tic => tic.proposals.length),
                                            }] }
                                            width="100%"
                                        />
                                    ) : (
                                        <Spinner />
                                    )
                                }
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item sm={ 12 } md={ 6 } className={ classes.item }>
                        <Card className={ classes.card } square={ true }>
                            <CardContent>
                                <Heading>Proposals By Stage</Heading>
                            </CardContent>
                            <CardContent>
                                {
                                    (proposalsByStage) ? (
                                        <ApexChart type="pie" width="100%"
                                            options={ this.pieChartOptions(proposalsByStage.map(stage => stage.name)) }
                                            series={ proposalsByStage.map(stage => stage.proposals.length) }
                                        />
                                    ) : (
                                        <Spinner />
                                    )
                                }
                            </CardContent>
                        </Card>
                    </Grid>

                </Grid>

            </div>
        )
    }
}

export default withTheme()(withStyles(styles)(HomePage))