import React, { useState, useEffect, useContext, useRef } from 'react'
import classnames from 'classnames'
import axios from 'axios'
import { withStyles } from '@material-ui/core/styles'
import { Card, CardContent } from '@material-ui/core'
import { Button } from '@material-ui/core'

import Heading from '../components/Typography/Heading'
import Subheading from '../components/Typography/Subheading'
import { CircularLoader } from '../components/Progress/Progress'
import Calendar from '../components/Charts/ProposalsCalendar'
import TicBarChart from '../components/Charts/ProposalsByTic'
import StatusBarChart from '../components/Charts/ProposalsByStatus'

import { ApiContext } from '../contexts/ApiContext'

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
        },
    },
    barChartContainer: {
        height: '700px',
        position: 'relative',
    },
    calendarContainer: {
        height: `calc(100vw * 30/55 + 64px)`,
        [theme.breakpoints.up('sm')]: {
            height: `calc((100vw - 240px) * 26/55 + 64px)`,
        }
    },
    pieChartContainer: {
        height: '700px',
    },
    groupingButtonsContainer: {
        textAlign: 'right',
        position: 'absolute',
        bottom: 3 * theme.spacing.unit,
        right: 1 * theme.spacing.unit,
    },
    groupingButton: {
        margin: `0 ${ theme.spacing.unit }px`
    },
})

const HomePage = (props) => {
    const { classes, theme } = props
    const [width, setWidth] = useState(0)
    const [grouping, setGrouping] = useState('tic')
    const [proposalsByTic, setProposalsByTic] = useState([])
    const [proposalsByDate, setProposalsByDate] = useState([])
    const [proposalsByStatus, setProposalsByStatus] = useState([])
    const [statuses, setStatuses] = useState([])
    const [tics, setTics] = useState([])
    const api = useContext(ApiContext)

    useEffect(() => {
        const promises = [
            axios.get(api.proposalsByTic),
            axios.get(api.proposalsByDate),
            axios.get(api.proposalsByStatus),
            axios.get(api.statuses),
            axios.get(api.tics),
        ]
        Promise.all(promises)
            .then((response) => {
                setProposalsByTic(response[0].data)
                setProposalsByDate(response[1].data)
                setProposalsByStatus(response[2].data)
                setStatuses(response[3].data)
                setTics(response[4].data)
            })
            .catch(error => console.log('Error', error))
    }, [])
        
    const handleGroupingToggle = (status) => setGrouping(status)

    return (
        <div className={ classes.page }>

            <div className={ classes.pageTitle }>
                <Heading>Dashboard Home</Heading>
            </div>

            <Card className={ classes.card } square={ true }>
                <CardContent className={ classnames(classes.chartContainer, classes.barChartContainer) }>
                    {
                        grouping === 'tic' ? (
                            // grouping === 'tic'
                            (proposalsByTic.length > 0) ? (
                                <TicBarChart proposals={ proposalsByTic }
                                    statuses={ statuses.map(({ description }) => description) }
                                    colors={ Object.values(theme.palette.extended) }
                                />
                            ) : <CircularLoader />
                        ) : (
                            // grouping === 'status'
                            (proposalsByStatus.length > 0) ? (
                                <StatusBarChart proposals={ proposalsByStatus }
                                    tics={ tics.map(({ description }) => description) }
                                    colors={ Object.values(theme.palette.extended).splice(0, 4) }
                                />
                            ) : <CircularLoader />
                        )
                    }
                    <div className={ classes.groupingButtonsContainer }>
                        <Button
                            className={ classes.groupingButton }
                            variant="contained"
                            size="small"
                            color={ grouping === 'tic' ? 'secondary' : 'default' }
                            onClick={ () => handleGroupingToggle('tic') }
                        >Group by TIC/RIC</Button>
                        <Button
                            className={ classes.groupingButton }
                            variant="contained"
                            size="small"
                            color={ grouping === 'status' ? 'secondary' : 'default' }
                            onClick={ () => handleGroupingToggle('status') }
                        >Group by Status</Button>
                    </div>
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
                        (proposalsByDate.length > 0) ? (
                            <Calendar proposals={ proposalsByDate }
                                fromDate="2016-01-01T12:00:00.000Z"
                                toDate="2018-12-31T12:00:00.000Z"
                                colors={ Object.values(theme.palette.extended).slice(1,6) }
                            />
                        ) : <CircularLoader />
                    }
                </CardContent>
            </Card>

        </div>
    )
}

export default withStyles(styles, { withTheme: true })(HomePage)