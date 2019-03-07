import React, { useContext, useEffect, useState } from 'react'
import { ResponsiveBar } from '@nivo/bar'
import { Card, CardHeader, CardContent } from '@material-ui/core'
import { StoreContext } from '../../contexts/StoreContext'
import { CircularLoader } from '../Progress/Progress'
import ChartTooltip from '../Tooltip/ChartTooltip'

const AverageDays = props => {
    const [store, setStore] = useContext(StoreContext)
    const [averageDays, setAverageDays] = useState({
        submsisionToPatApproval: 0,
        submsisionToServicesOngoing: 0,
        approvalToGrantSubmission: 0,
        submissionToGrantSubmission: 0,
        grantSubmissionToGrantAward: 0,
    })

    const findAverageDaysBetween = (field1, field2) => {
        let proposalsCount = 0
        const total = store.proposals.reduce((totalDays, proposal) => {
            if (proposal[field1] && proposal[field2]) {
                proposalsCount += 1
                return totalDays + Math.round(Math.abs(new Date(proposal[field2]) - new Date(proposal[field1])))/(1000 * 60 * 60 * 24)
            }
            return totalDays
        }, 0)
        return Math.round(total / proposalsCount)
    }
    
    useEffect(() => {
        if (store.proposals) {
            const submsisionToPatApproval = findAverageDaysBetween('dateSubmitted', 'meetingDate')
            const submsisionToServicesOngoing = 0
            const approvalToGrantSubmission = findAverageDaysBetween('meetingDate', 'plannedGrantSubmissionDate')
            const submissionToGrantSubmission = findAverageDaysBetween('dateSubmitted', 'plannedGrantSubmissionDate')
            const grantSubmissionToGrantAward = findAverageDaysBetween('plannedGrantSubmissionDate', 'fundingStart')
            setAverageDays({
                submsisionToPatApproval,
                submsisionToServicesOngoing,
                approvalToGrantSubmission,
                submissionToGrantSubmission,
                grantSubmissionToGrantAward,
            }) 
        }
    }, [store])

    return (
        <Card>
            <CardHeader title="Average Days" subheader="" />
            <CardContent style={{ height: '200px' }}>
                <ResponsiveBar
                    data={[
                        { timespan: 'Submission to PAT Approval',         days: averageDays.submsisionToPatApproval, },
                        { timespan: 'Submission to Services Ongoing',     days: 0, },
                        { timespan: 'PAT Approval to Grant Submission',   days: averageDays.approvalToGrantSubmission, },
                        { timespan: 'Submission to Grant Submission',     days: averageDays.submissionToGrantSubmission, },
                        { timespan: 'Grant Submission to Grant Award',    days: averageDays.grantSubmissionToGrantAward, },
                    ]}
                    keys={ ['days'] }
                    indexBy="timespan"
                    margin={{ top: 0, right: 32, bottom: 32, left: 220 }}
                    layout='horizontal'
                    enableGridY={ false }
                    padding={ 0 }
                    colors='nivo'
                    colorBy='timespan'
                    borderColor='inherit:darker(1.6)'
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
                    labelTextColor='inherit:darker(1.6)'
                    animate={ true }
                    motionStiffness={ 90 }
                    motionDamping={ 15 }
                    legends={ [] }
                    tooltip={ ({ id, value, color, indexValue }) => (
                        <ChartTooltip color={ color }>
                            <div><strong>{ indexValue }</strong></div>
                            <div>~ { value } Day{ value !==  1 ? 's' : null }</div>
                        </ChartTooltip>
                    )} 
                />
            </CardContent>
        </Card>
    )
}

export default AverageDays