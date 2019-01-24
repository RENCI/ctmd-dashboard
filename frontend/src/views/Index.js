import React, { Component } from 'react'
import classnames from 'classnames'
import axios from 'axios'
import { withStyles } from '@material-ui/core/styles'
import { Grid, Card, CardContent } from '@material-ui/core'
import ApexChart from 'react-apexcharts'

import Heading from '../components/Typography/Heading'
import Paragraph from '../components/Typography/Paragraph'
import Spinner from '../components/Spinner/Spinner'
import Calendar from '../components/Charts/ProposalsCalendar'
import TicBarChart from '../components/Charts/ProposalsByTic'

const apiRoot = (process.env.NODE_ENV === 'production') ? 'https://pmd.renci.org/api/' : 'http://localhost:3030/'
const apiUrl = {
    proposalsByTic: apiRoot + 'proposals/by-tic',
    proposalsByStage: apiRoot + 'proposals/by-stage',
    proposalsByDate: apiRoot + 'proposals/by-date',
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
    },
    barChartContainer: {
        width: 'calc(100vw - 96px)',
        height: '650px',
        [theme.breakpoints.up('sm')]: {
            width: 'calc(100vw - 240px - 96px)',
        }
    },
    calendarContainer: {
        height: `calc(100vw * 74/100 + 160px)`,
        width: 'calc(100vw - 96px)',
        height: 'calc((100vw - 64px) * 30/52 + 160px)',
        [theme.breakpoints.up('sm')]: {
            width: 'calc(100vw - 240px - 96px)',
            height: 'calc((100vw - 240px - 64px) * 30/52 + 160px)',
        }
    }
})

class HomePage extends Component {
    state = {
        proposalsByTic: [],
        proposalsByStage: [],
        proposalsByDate: [],
    }

    chartOptions = (categories = []) => ({
        fill: { colors: 'blue' },
        plotOptions: {
            bar: {
                columnWidth: '90%',
                dataLabels: { position: 'top', },
            }
        },
        dataLabels: {
            offsetY: -20,
            style: {
                fontSize: '12px',
                colors: [this.props.theme.palette.primary.main],
            }
        },  
        stroke: { width: 0, },
        xaxis: {
            labels: { show: categories.length > 0 ? true : false },
            categories: categories,
            axisTicks: { show: false, },
            axisBorder: { show: false },
        },
        yaxis: {
            show: false,
        },
        grid: { show: false, },
    })

    componentDidMount() {
        const promises = [
            axios.get(apiUrl.proposalsByTic),
            axios.get(apiUrl.proposalsByStage),
            axios.get(apiUrl.proposalsByDate),
        ]
        Promise.all(promises)
            .then((response) => {
                this.setState({
                    proposalsByTic: response[0].data,
                    proposalsByStage: response[1].data,
                    proposalsByDate: response[2].data,
                })
            })
            .catch(error => {
                console.log('Error', error)
            })
    }

    render() {
        const { classes, theme } = this.props
        const { proposalsByTic, proposalsByStage, proposalsByDate } = this.state
        return (
            <div className={ classes.root }>
                <Heading>Dashboard Home</Heading>
                
                <br/>

                <Card className={ classnames(classes.card, classes.barChartContainer) } square={ true }>
                    <CardContent style={{ height: '300px' }}>
                        {
                            (proposalsByTic) ? (
                                <TicBarChart proposals={ proposalsByTic }
                                    colors={ Object.values(theme.palette.extended) }
                                />
                            ) : (
                                <Spinner />
                            )
                        }
                    </CardContent>
                </Card>

                <Card className={ classnames(classes.card, classes.calendarContainer) } square={ true }>
                        {
                            (proposalsByDate) ? (
                                    <Calendar proposals={ proposalsByDate }
                                        fromDate="2017-01-01"
                                        toDate="2018-12-31"
                                        colors={ Object.values(theme.palette.extended).slice(1,6) }
                                    />
                            ) : (
                                <Spinner />
                            )
                        }
                </Card>

            </div>
        )
    }
}

export default withStyles(styles, { withTheme: true })(HomePage)