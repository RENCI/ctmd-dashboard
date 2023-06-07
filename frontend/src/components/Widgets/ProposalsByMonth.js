import React, { useContext, useState, useEffect } from 'react'
import { useTheme } from '@material-ui/styles'
import { ResponsiveBar } from '@nivo/bar'
import { ResponsiveLine } from '@nivo/line'
import { Button, Tooltip } from '@material-ui/core'
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab'
import {
    KeyboardArrowLeft as LeftIcon,
    KeyboardArrowRight as RightIcon,
    BarChart as BarGraphIcon,
    ShowChart as LineGraphIcon,
} from '@material-ui/icons'
import { StoreContext } from '../../contexts/StoreContext'
import { CircularLoader } from '../Progress/Progress'
import { Widget } from './Widget'
import { ChartTooltip } from '../Tooltip'

let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const thisMonth = (new Date()).getMonth() + 1
const thisYear = (new Date()).getFullYear()

const BAR = 'bar'
const LINE = 'line'

export const ProposalsByMonthChart = props => {
    const [store, ] = useContext(StoreContext)
    const [proposalGroupsBar, setProposalGroupsBar] = useState([])
    const [proposalGroupsLine, setProposalGroupsLine] = useState([])
    const [currentPosition, setCurrentPosition] = useState(-1)
    const [startLabel, setStartLabel] = useState('...')
    const [endLabel, setEndLabel] = useState('...')
    const [graphType, setGraphType] = useState(LINE)
    const theme = useTheme()

    useEffect(() => {
        let timeline = []
        if (store.proposals && store.proposals.length > 0) {
            const earliestDate = store.proposals.filter(proposal => proposal.dateSubmitted !== null).map(proposal => proposal.dateSubmitted).sort()[0]
            if (earliestDate) {
                let [earliestYear, earliestMonth] = earliestDate.split('-')
                earliestYear = parseInt(earliestYear)
                earliestMonth = parseInt(earliestMonth)
                let elapsedMonths = 12 * (thisYear - earliestYear)
                elapsedMonths += thisMonth - earliestMonth
                let year = earliestYear
                for (let i = 0; i < elapsedMonths; i++) {
                    const month = (earliestMonth + i) % 12 + 1
                    if (month === 1 && i !== 0) year += 1
                    let date = `${ year }-`
                    date += month < 10 ? `0${ month }` : month
                    timeline.push({
                        date,
                        label: function(date) {
                            const [year, month] = date.split('-')
                            return `${ months[parseInt(month) - 1] } ${ year }`
                        }(date),
                        count: 0 })
                }
                store.proposals.forEach(({ dateSubmitted }) => {
                    if (dateSubmitted) {
                        const shortDate = dateSubmitted.slice(0, 7)
                        const index = timeline.findIndex(time => time.date === shortDate)
                        if (index >= 0) timeline[index].count += 1
                    }
                })
            }
        }
        const lineData = timeline.map(({ label, count }) => ({ x:label, y: count }))
        setProposalGroupsBar(timeline)
        setProposalGroupsLine(lineData)
    }, [store])

    useEffect(() => {
        setCurrentPosition(proposalGroupsBar.length - 12)
    }, [proposalGroupsBar])

    useEffect(() => {
        if (proposalGroupsBar && currentPosition >= 0) {
            setStartLabel(proposalGroupsBar[currentPosition].label)
            setEndLabel(proposalGroupsBar[currentPosition + 11].label)
        }
    }, [currentPosition])

    const handlePositionChange = delta => event => {
        if (currentPosition + delta >= 0 && currentPosition + delta <= proposalGroupsBar.length) {
            setCurrentPosition(currentPosition + delta)
        }
    }

    const handleToggleGraphType = (event, newType) => setGraphType(newType)

    return (
        <Widget
            title={ `Submissions by Month` }
            subtitle={ `${ startLabel } to ${ endLabel }` }
            action={
                <div>
                    <Button disabled={ currentPosition === 0 } onClick={ handlePositionChange(-1) }>
                        <LeftIcon />
                    </Button>
                    <Button disabled={ currentPosition === proposalGroupsBar.length - 12} onClick={ handlePositionChange(1) }>
                        <RightIcon />
                    </Button>
                    <ToggleButtonGroup value={ graphType } exclusive onChange={ handleToggleGraphType } style={{ margin: '0 1rem' }}>
                        <ToggleButton value={ BAR } selected={ graphType === BAR } disabled={ graphType === BAR }>
                            <Tooltip title="Bar Graph"><BarGraphIcon /></Tooltip>
                        </ToggleButton>
                        <ToggleButton value={ LINE } selected={ graphType === LINE } disabled={ graphType === LINE }>
                            <Tooltip title="Line Graph"><LineGraphIcon /></Tooltip>
                        </ToggleButton>
                    </ToggleButtonGroup>
                </div>
            }
        >
            <div style={{ height: '236px' }}>
                {
                    proposalGroupsBar && graphType === BAR && (
                        <ResponsiveBar
                            data={ proposalGroupsBar.slice(currentPosition, currentPosition + 12) }
                            keys={ ['count'] }
                            indexBy="label"
                            layout="vertical"
                            margin={{ top: 0, left: 0, right: 0, bottom: 120 }}
                            height={ 236 }
                            colors={ theme.palette.chartColors }
                            colorBy='date'
                            // colorBy='index'
                            // maxValue={ Math.max(...proposalGroupsBar.map(({ count }) => count)) }
                            borderColor='inherit:darker(1.6)'
                            axisBottom={{
                                tickSize: 5,
                                tickPadding: 5,
                                tickRotation: -90,
                                legend: '',
                                legendPosition: 'middle',
                                legendOffset: 130
                            }}
                            axisLeft={ null }
                            enableGridX={ false }
                            enableGridY={ false }
                            labelSkipWidth={ 12 }
                            labelSkipHeight={ 12 }
                            labelTextColor="inherit:darker(1.6)"
                            animate={ true }
                            motionStiffness={ 90 }
                            motionDamping={ 15 }
                            legends={ [] }
                            tooltip={ ({ id, value, color, indexValue }) => (
                                <ChartTooltip color={ color }>
                                    <div><strong>{ indexValue }</strong></div>
                                    <div>{ value } Proposal{ value > 1 ? 's' : null }</div>
                                </ChartTooltip>
                            )}
                        />
                    )
                }
                {
                    proposalGroupsLine && graphType === LINE && (
                        <ResponsiveLine
                            data={ [{ data: proposalGroupsLine.slice(currentPosition, currentPosition + 12) }] }
                            curve="linear"
                            isInteractive={ true }
                            margin={{ top: 0, left: 20, right: 20, bottom: 120 }}
                            xScale={{ type: 'point' }}
                            yScale={{ type: 'linear', min: 0, max: 15, stacked: false, reverse: false }}
                            axisTop={ null }
                            axisRight={ null }
                            axisBottom={{
                                orient: 'bottom',
                                tickSize: 5,
                                tickPadding: 5,
                                tickRotation: -90,
                                legend: '',
                                legendPosition: 'middle',
                                legendOffset: 0,
                            }}
                            axisLeft={ null }
                            height={ 236 }
                            colors={ theme.palette.chartColors }
                            pointSize={ 10 }
                            pointLabel="y"
                            pointBorderWidth={ 2 }
                            pointBorderColor="black"
                            pointColor={{ from: 'color', modifiers: [] }}
                            pointLabelOffset={ -12 }
                            useMech={ true }
                            legends={ [] }
                        />
                    )
                }
                { !proposalGroupsBar && <CircularLoader /> }
            </div>
        </Widget>
    )
}
