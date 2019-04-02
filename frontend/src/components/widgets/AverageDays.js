import React, { useContext, useEffect, useState } from 'react'
import { useTheme } from '@material-ui/styles'
import { ResponsiveBar } from '@nivo/bar'
import { Card, CardHeader, CardContent } from '@material-ui/core'
import { StoreContext } from '../../contexts/StoreContext'
import { CircularLoader } from '../Progress/Progress'
import ChartTooltip from '../Tooltip/ChartTooltip'

const AverageDays = props => {
    const [store, setStore] = useContext(StoreContext)
    const [averageDays, setAverageDays] = useState({
        submsisionToPatApproval: 0,
        approvalToGrantSubmission: 0,
        submissionToGrantSubmission: 0,
        grantSubmissionToGrantAward: 0,
    })
    const theme = useTheme()

    const findAverageDaysBetween = (field1, field2) => {
        let count = 0
        const total = store.proposals.reduce((totalDays, proposal) => {
            if (proposal[field1] && proposal[field2]) {
                count += 1
                return totalDays + Math.round(Math.abs(new Date(proposal[field2]) - new Date(proposal[field1])))/(1000 * 60 * 60 * 24)
            }
            return totalDays
        }, 0)
        return [Math.round(total / count), count]
    }
    
    useEffect(() => {
        if (store.proposals) {
            const submsisionToPatApproval = findAverageDaysBetween('dateSubmitted', 'meetingDate')
            const approvalToGrantSubmission = findAverageDaysBetween('meetingDate', 'plannedGrantSubmissionDate')
            const submissionToGrantSubmission = findAverageDaysBetween('dateSubmitted', 'plannedGrantSubmissionDate')
            const grantSubmissionToGrantAward = findAverageDaysBetween('plannedGrantSubmissionDate', 'fundingStart')
            setAverageDays({
                submsisionToPatApproval,
                approvalToGrantSubmission,
                submissionToGrantSubmission,
                grantSubmissionToGrantAward,
            }) 
        }
    }, [store])

    const averages = {
        grantSubmissionToGrantAward: averageDays.grantSubmissionToGrantAward,
        submissionToGrantSubmission: averageDays.submissionToGrantSubmission,
        approvalToGrantSubmission: averageDays.approvalToGrantSubmission,
        submsisionToPatApproval: averageDays.submsisionToPatApproval,
    }

    return (
        <Card>
            <CardHeader title="Averages" subheader="Average number of days between notable times over the proposal lifespan" />
            <CardContent style={{ height: '180px' }}>
                <ResponsiveBar
                    data={[
                        { timespan: 'Grant Submission to Grant Award',    days: averages.grantSubmissionToGrantAward[0],    count: averages.grantSubmissionToGrantAward[1]},
                        { timespan: 'Submission to Grant Submission',     days: averages.submissionToGrantSubmission[0],    count: averages.submissionToGrantSubmission[1]},
                        { timespan: 'PAT Approval to Grant Submission',   days: averages.approvalToGrantSubmission[0],      count: averages.approvalToGrantSubmission[1]},
                        { timespan: 'Submission to PAT Approval',         days: averages.submsisionToPatApproval[0],        count: averages.submsisionToPatApproval[1]},
                    ]}
                    keys={ ['days'] }
                    indexBy="timespan"
                    margin={{ top: 0, right: 32, bottom: 32, left: 186 }}
                    layout="horizontal"
                    enableGridY={ false }
                    padding={ 0.2 }
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
                    labelSkipWidth={ 0 }
                    labelSkipHeight={ 12 }
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