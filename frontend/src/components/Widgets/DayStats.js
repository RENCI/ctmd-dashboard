import React, { Fragment, useContext, useEffect, useState } from 'react'
import { useTheme } from '@material-ui/styles'
import { ResponsiveBar } from '@nivo/bar'
import { Grid, CardHeader, Typography } from '@material-ui/core'
import { Button, Menu, MenuItem } from '@material-ui/core'
import { KeyboardArrowDown as MoreIcon } from '@material-ui/icons'
import { StoreContext } from '../../contexts/StoreContext'
import { ChartTooltip } from '../Tooltip'
import { Widget } from './Widget'

export const DayStats = props => {
    const [store, ] = useContext(StoreContext)
    const [proposals, setProposals] = useState(null)
    const [anchorEl, setAnchorEl] = React.useState(null)
    const [tic, setTic] = useState('')
    const theme = useTheme()
    const [averageDays, setAverageDays] = useState({
        submissionToPatApproval: 0,
        approvalToGrantSubmission: 0,
        submissionToGrantSubmission: 0,
        grantSubmissionToGrantAward: 0,
        submissionToContact: 0,
        submissionToKickOff: 0
    })
    const [medianDays, setMedianDays] = useState({
        submissionToPatApproval: 0,
        approvalToGrantSubmission: 0,
        submissionToGrantSubmission: 0,
        grantSubmissionToGrantAward: 0,
        submissionToContact: 0,
        submissionToKickOff: 0
    })

    const handleClick = event => setAnchorEl(event.currentTarget)
    
    const handleSelect = event => {
        setTic(event.target.getAttribute('value'))
        setAnchorEl(null)
    }
    
    const handleClose = () => setAnchorEl(null)

    const businessDaysBetween = (date1, date2) => {
        // Clone date to avoid messing up original date and time
        const d1 = new Date(date1.getTime())
        const d2 = new Date(date2.getTime())
        let days = 1;

        // Reset time portion
        d1.setHours(0, 0, 0, 0);
        d2.setHours(0, 0, 0, 0);

        while (d1 < d2) {
            d1.setDate(d1.getDate() + 1);
            const day = d1.getDay();
            if (day !== 0 && day !== 6) {
                days++;
            }
        }

        return days;
    }

    const findAverageDaysBetween = (proposals, field1, field2, businessDays = false) => {
        let count = 0
        const total = proposals.reduce((totalDays, proposal) => {
            if (proposal[field1] && proposal[field2]) {
                count += 1
                
                const date1 = new Date(proposal[field1])
                const date2 = new Date(proposal[field2])

                return totalDays + (businessDays ? businessDaysBetween(date1, date2) :
                    Math.floor(date2 - date1) / (1000 * 60 * 60 * 24))
            }
            return totalDays
        }, 0)
        return [Math.round(total / count), count]
    }
    
    const findMedianDaysBetween = (proposals, field1, field2, businessDays = false) => {
        const differences = proposals.filter(proposal => proposal[field1] && proposal[field2])
            .map(proposal => {
                const date1 = new Date(proposal[field2])
                const date2 = new Date(proposal[field2])

                return businessDays ? businessDaysBetween(date1, date2) :
                    Math.floor((date2 - date1) / (1000 * 60 * 60 * 24))
            })
            .sort()
        if (differences.length % 2 === 0) {
            const index1 = differences.length / 2 - 1
            const index2 = differences.length / 2
            const median = Math.round((differences[index1] + differences[index2]) / 2)
            return [median, differences.length]
        } else {
            const middleIndex = (differences.length - 1) / 2
            const median = Math.round(differences[middleIndex])
            return [median, differences.length]
        }
    }
    
    useEffect(() => {
        setProposals(store.proposals)
    }, [store])

    useEffect(() => {
        if (tic !== '') {
            setProposals(store.proposals.filter(proposal => proposal.assignToInstitution === tic))
        } else {
            setProposals(store.proposals)
        }
    }, [tic])
    
    useEffect(() => {
        if (proposals) {
            setAverageDays({
                submissionToPatApproval: findAverageDaysBetween(proposals, 'dateSubmitted', 'meetingDate'),
                approvalToGrantSubmission: findAverageDaysBetween(proposals, 'meetingDate', 'actualGrantSubmissionDate'),
                submissionToGrantSubmission: findAverageDaysBetween(proposals, 'dateSubmitted', 'actualGrantSubmissionDate'),
                grantSubmissionToGrantAward: findAverageDaysBetween(proposals, 'actualGrantSubmissionDate', 'fundingStart'),
                submissionToKickOff: findAverageDaysBetween(proposals, 'dateSubmitted', 'kickOff'),
                submissionToContact: findAverageDaysBetween(proposals, 'dateSubmitted', 'firstContact', true)
            }) 
            setMedianDays({
                submissionToPatApproval: findMedianDaysBetween(proposals, 'dateSubmitted', 'meetingDate'),
                approvalToGrantSubmission: findMedianDaysBetween(proposals, 'meetingDate', 'actualGrantSubmissionDate'),
                submissionToGrantSubmission: findMedianDaysBetween(proposals, 'dateSubmitted', 'actualGrantSubmissionDate'),
                grantSubmissionToGrantAward: findMedianDaysBetween(proposals, 'actualGrantSubmissionDate', 'fundingStart'),
                submissionToKickOff: findMedianDaysBetween(proposals, 'dateSubmitted', 'kickOff'),
                submissionToContact: findMedianDaysBetween(proposals, 'dateSubmitted', 'firstContact', true)
            }) 
        }
    }, [proposals])

    // Reorder colors, as requested in issue #471
    const c = theme.palette.chartColors
    const colors = [
        //pink, yellow, purple, orange, green
        c[3], c[5], c[2], c[1], c[4]
    ].reverse()

    return (
        <Widget
            title="Timeline Metrics"
            info="These graphs show the number of days (business or calendar) between notable points over the proposal-to-grant submission lifespan&mdash;from the time of proposal submission to initial contact, to kick-off meeting, to PAT approval, and to grant submission, and from time of PAT approval to grant submission."
            action={
                <Fragment>
                    <Button variant="text" color="primary"
                        aria-owns={ anchorEl ? 'tic-menu' : undefined }
                        aria-haspopup="true"
                        onClick={ handleClick }
                    >{ tic || 'All TICs' }<MoreIcon/></Button>
                    <Menu id="tic-menu" anchorEl={ anchorEl } open={ Boolean(anchorEl) } onClose={ handleClose }>
                        <MenuItem onClick={ handleSelect } value="">All</MenuItem>
                        {
                            store.tics && store.tics.map(
                                ({ name }) => <MenuItem key={ name } onClick={ handleSelect } value={ name }>{ name }</MenuItem>
                            )
                        }
                    </Menu>
                </Fragment>
            }
        >
            <Grid container>
                <Grid item xs={ 12 }>
                    <Typography variant="h4">Average Number of Days</Typography>
                    <br/><br/>
                    <div style={{ height: '180px' }}>
                        <ResponsiveBar
                            data={[
                                // { timespan: 'Grant Submission to Grant Award',    days: averageDays.grantSubmissionToGrantAward[0],    count: averageDays.grantSubmissionToGrantAward[1] },                                
                                { timespan: 'Proposal Submission to Grant Submission',     days: averageDays.submissionToGrantSubmission[0],    count: averageDays.submissionToGrantSubmission[1] },
                                { timespan: 'PAT Approval to Grant Submission',   days: averageDays.approvalToGrantSubmission[0],      count: averageDays.approvalToGrantSubmission[1] },
                                { timespan: 'Proposal Submission to PAT Approval',         days: averageDays.submissionToPatApproval[0],        count: averageDays.submissionToPatApproval[1] },
                                { timespan: 'Proposal Submission to Kick-off Meeting', days: averageDays.submissionToKickOff[0], count: averageDays.submissionToKickOff[1] },
                                { timespan: 'Proposal Submission to Initial Contact*', days: averageDays.submissionToContact[0], count: averageDays.submissionToContact[1] }
                            ]}
                            keys={ ['days'] }
                            indexBy="timespan"
                            margin={{ top: 0, right: 32, bottom: 0, left: 290 }}
                            layout="horizontal"
                            enableGridY={ false }
                            padding={ 0.1 }
                            colors={ colors }
                            colorBy="index"
                            borderColor="inherit:darker(1.6)"
                            axisTop={ null }
                            axisRight={ null }
                            axisBottom={ null }
                            axisLeft={{ tickSize: 0, tickPadding: 16, tickRotation: 0, legend: '', legendPosition: 'middle', legendOffset: 0 }}
                            labelSkipWidth={ 50 }
                            labelFormat={ d => `${ d } days` }
                            labelTextColor="inherit:darker(1.6)"
                            animate={ true }
                            motionStiffness={ 90 }
                            motionDamping={ 15 }
                            legends={ [] }
                            tooltip={ ({ id, value, color, indexValue, data }) => (
                                <ChartTooltip color={ color }>
                                    <div><strong>{ indexValue }</strong></div>
                                    <div>~ { value } Day{ value !==  1 ? 's' : null }</div>
                                    <div style={{ opacity: 0.5, fontSize: '90%' }}><small>Calculated from { data.count } Proposals</small></div>
                                </ChartTooltip>
                            )} 
                        />
                        <div style={{ color: "#999", marginTop: "1em" }}>*Expressed in weekdays. All others are calendar days.</div>
                    </div>
                </Grid>
            </Grid>
        </Widget>
    )
}
