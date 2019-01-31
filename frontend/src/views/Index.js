import React, { Component } from 'react'
import classnames from 'classnames'
import axios from 'axios'
import { withStyles } from '@material-ui/core/styles'
import { Card, CardContent } from '@material-ui/core'

import Heading from '../components/Typography/Heading'
import Subheading from '../components/Typography/Subheading'
import { CircularLoader } from '../components/Progress/Progress'
import Calendar from '../components/Charts/ProposalsCalendar'
import TicBarChart from '../components/Charts/ProposalsByTic'

const apiRoot = (process.env.NODE_ENV === 'production') ? 'https://pmd.renci.org/api/' : 'http://localhost:3030/'
const apiUrl = {
    proposalsByTic: apiRoot + 'proposals/by-tic',
    proposalsByDate: apiRoot + 'proposals/by-date',
    proposalStatuses: apiRoot + 'statuses',
}

const styles = (theme) => ({
    page: {
        // ...theme.mixins.debug
    },
    card: {
        marginBottom: 2 * theme.spacing.unit,
        backgroundColor: theme.palette.grey[100],
    },
    chartContainer: {
        padding: 4 * theme.spacing.unit,
        width: 'calc(100vw - 48px)',
        [theme.breakpoints.up('sm')]: {
            width: 'calc(100vw - 240px - 86px)',
        }
    },
    barChartContainer: {
        height: '670px',
    },
    calendarContainer: {
        height: `calc(100vw * 30/55 + 64px)`,
        [theme.breakpoints.up('sm')]: {
            height: `calc((100vw - 240px) * 26/55 + 64px)`,
        }
    }
})

class HomePage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            width: 0,
            height: 0,
            proposalsByTic: [],
            proposalsByDate: [],
            proposalStatuses: [],
        }
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this)
    }

    updateWindowDimensions() {
        this.setState({ width: window.innerWidth, height: window.innerHeight })
    }

    componentDidMount() {
        this.updateWindowDimensions()
        window.addEventListener('resize', this.updateWindowDimensions)
        const promises = [
            axios.get(apiUrl.proposalsByTic),
            axios.get(apiUrl.proposalsByDate),
            axios.get(apiUrl.proposalStatuses),
        ]
        Promise.all(promises)
            .then((response) => {
                this.setState({
                    proposalsByTic: response[0].data,
                    proposalsByDate: response[1].data,
                    proposalStatuses: response[2].data,
                })
            })
            .catch(error => {
                console.log('Error', error)
            })
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
    }
    
    render() {
        const { width, height } = this.state
        const { classes, theme } = this.props
        const { proposalsByTic, proposalsByDate, proposalStatuses } = this.state
        return (
            <div className={ classes.page }>

                <div className={ classes.pageTitle }>
                    <Heading>Dashboard Home</Heading>
                </div>

                <Card className={ classes.card } square={ true }>
                    <CardContent className={ classnames(classes.chartContainer, classes.barChartContainer) }>
                        {
                            (proposalsByTic) ? (
                                <TicBarChart proposals={ proposalsByTic }
                                    statuses={ proposalStatuses.map(({ description }) => description) }
                                    colors={ Object.values(theme.palette.extended) }
                                    width={ width } height={ height }
                                />
                            ) : (
                                <CircularLoader />
                            )
                        }
                    </CardContent>
                </Card>

                <Card className={ classnames(classes.card) } square={ true }>
                    <CardContent className={ classnames(classes.chartContainer, classes.calendarContainer) }>
                        <Subheading>
                            {
                                (proposalsByDate.length > 0) ? (
                                        <span>
                                            { proposalsByDate.map(({ value }) => value).reduce((value, count) => count + value) }
                                        </span>
                                ) : null
                            }
                            &nbsp;Submitted Proposals Since 2016
                        </Subheading>
                        {
                            (proposalsByDate) ? (
                                    <Calendar proposals={ proposalsByDate }
                                        fromDate="2016-01-01T12:00:00.000Z"
                                        toDate="2018-12-31T12:00:00.000Z"
                                        colors={ Object.values(theme.palette.extended).slice(1,6) }
                                    />
                            ) : (
                                <CircularLoader />
                            )
                        }
                    </CardContent>
                </Card>

            </div>
        )
    }
}

export default withStyles(styles, { withTheme: true })(HomePage)