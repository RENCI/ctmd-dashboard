import React, { useContext, useEffect, useState } from 'react'
import { useTheme } from '@material-ui/styles'
import { ResponsiveBar } from '@nivo/bar'
import { Card, CardHeader, CardContent } from '@material-ui/core'
import { StoreContext } from '../../contexts/StoreContext'
import ChartTooltip from '../Tooltip/ChartTooltip'

const AverageDays = props => {
    const [store, ] = useContext(StoreContext)
    const [averageDays, setAverageDays] = useState({
        submsisionToPatApproval: 0,
        approvalToGrantSubmission: 0,
        submissionToGrantSubmission: 0,
        grantSubmissionToGrantAward: 0,
    })
    const [medianDays, setMedianDays] = useState({
        submsisionToPatApproval: 0,
        approvalToGrantSubmission: 0,
        submissionToGrantSubmission: 0,
        grantSubmissionToGrantAward: 0,
    })
    const [mode, setMode] = useState('average')
    const theme = useTheme()

    const findAverageDaysBetween = (field1, field2) => {
        let count = 0
        const total = store.proposals.reduce((totalDays, proposal) => {
            if (proposal[field1] && proposal[field2]) {
                count += 1
                return totalDays + Math.round(new Date(proposal[field2]) - new Date(proposal[field1]))/(1000 * 60 * 60 * 24)
            }
            return totalDays
        }, 0)
        return [Math.round(total / count), count]
    }
    
    const findMedianDaysBetween = (field1, field2) => {
        const differences = store.proposals.filter(proposal => proposal[field1] && proposal[field2])
            .map(proposal => Math.floor((new Date(proposal[field2]) - new Date(proposal[field1])) / (1000 * 60 * 60 * 24)))
            .sort()
        if (differences.length % 2 === 0) {
            const index1 = differences.length / 2 - 1
            const index2 = differences.length / 2
            const median = (differences[index1] + differences[index2]) / 2
            return [median, differences.length]
        } else {
            const middleIndex = (differences.length - 1) / 2
            const median = differences[middleIndex]
            return [median, differences.length]
        }
    }
    
    useEffect(() => {
        if (store.proposals) {
            setAverageDays({
                submsisionToPatApproval: findAverageDaysBetween('dateSubmitted', 'meetingDate'),
                approvalToGrantSubmission: findAverageDaysBetween('meetingDate', 'actualGrantSubmissionDate'),
                submissionToGrantSubmission: findAverageDaysBetween('dateSubmitted', 'actualGrantSubmissionDate'),
                grantSubmissionToGrantAward: findAverageDaysBetween('actualGrantSubmissionDate', 'fundingStart'),
            }) 
            setMedianDays({
                submsisionToPatApproval: findMedianDaysBetween('dateSubmitted', 'meetingDate'),
                approvalToGrantSubmission: findMedianDaysBetween('meetingDate', 'actualGrantSubmissionDate'),
                submissionToGrantSubmission: findMedianDaysBetween('dateSubmitted', 'actualGrantSubmissionDate'),
                grantSubmissionToGrantAward: findMedianDaysBetween('actualGrantSubmissionDate', 'fundingStart'),
            }) 
        }
    }, [store])

    return (
        <Card>
            <CardHeader title="Averages" subheader="Average number of days between notable times over the proposal lifespan" />
            <CardContent style={{ height: '280px' }}>
                <ResponsiveBar
                    data={[
                        { timespan: 'Grant Submission to Grant Award',    days: averageDays.grantSubmissionToGrantAward[0],    count: averageDays.grantSubmissionToGrantAward[1]},
                        { timespan: 'Submission to Grant Submission',     days: averageDays.submissionToGrantSubmission[0],    count: averageDays.submissionToGrantSubmission[1]},
                        { timespan: 'PAT Approval to Grant Submission',   days: averageDays.approvalToGrantSubmission[0],      count: averageDays.approvalToGrantSubmission[1]},
                        { timespan: 'Submission to PAT Approval',         days: averageDays.submsisionToPatApproval[0],        count: averageDays.submsisionToPatApproval[1]},
                        // { timespan: 'Grant Submission to Grant Award',    days: medianDays.grantSubmissionToGrantAward[0],    count: medianDays.grantSubmissionToGrantAward[1]},
                        // { timespan: 'Submission to Grant Submission',     days: medianDays.submissionToGrantSubmission[0],    count: medianDays.submissionToGrantSubmission[1]},
                        // { timespan: 'PAT Approval to Grant Submission',   days: medianDays.approvalToGrantSubmission[0],      count: medianDays.approvalToGrantSubmission[1]},
                        // { timespan: 'Submission to PAT Approval',         days: medianDays.submsisionToPatApproval[0],        count: medianDays.submsisionToPatApproval[1]},
                    ]}
                    keys={ ['days'] }
                    indexBy="timespan"
                    margin={{ top: 0, right: 32, bottom: 32, left: 186 }}
                    layout="horizontal"
                    enableGridY={ false }
                    padding={ 0.1 }
                    colors={ theme.palette.chartColors }
                    colorBy="index"
                    borderColor="inherit:darker(1.6)"
                    axisTop={ null }
                    axisRight={ null }
                    axisBottom={ null }
                    axisLeft={{
                        tickSize: 0,
                        tickPadding: 16,
                        tickRotation: 0,
                        legend: '',
                        legendPosition: 'middle',
                        legendOffset: 0
                    }}
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
            </CardContent>
        </Card>
    )
}

export default AverageDays