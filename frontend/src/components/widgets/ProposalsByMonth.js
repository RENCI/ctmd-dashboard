import React, { useContext, useState, useEffect } from 'react'
import { useTheme } from '@material-ui/styles'
import { ResponsiveBar } from '@nivo/bar'
import ChartTooltip from '../Tooltip/ChartTooltip'
import { Button } from '@material-ui/core'
import { KeyboardArrowLeft as LeftIcon, KeyboardArrowRight as RightIcon } from '@material-ui/icons'
import { StoreContext } from '../../contexts/StoreContext'
import { CircularLoader } from '../Progress/Progress'
import Widget from './Widget'

let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const thisMonth = (new Date()).getMonth() + 1
const thisYear = (new Date()).getFullYear()

// const yyyymmToLabel => date => {}

const proposalsByMonth = props => {
    const [store, _] = useContext(StoreContext)
    const [proposalGroups, setProposalGroups] = useState([])
    const [currentPosition, setCurrentPosition] = useState(0)
    const theme = useTheme()

    useEffect(() => {
        let timeline = []
        if (store.proposals) {
            const earliestDate = store.proposals.map(proposal => proposal.dateSubmitted).sort()[0]
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
        setProposalGroups(timeline)
    }, [store])

    useEffect(() => {
        setCurrentPosition(proposalGroups.length - 12)
    }, [proposalGroups])

    const handlePositionChange = delta => event => {
        if (currentPosition + delta >= 0 && currentPosition + delta <= proposalGroups.length) {
            setCurrentPosition(currentPosition + delta)
        }
    }

    return (
        <Widget title={ `Submissions by Month` }
            action={
                <div>
                    <Button disabled={ currentPosition === 0 } onClick={ handlePositionChange(-1) }>
                        <LeftIcon />Prev
                    </Button>
                    <Button disabled={ currentPosition === proposalGroups.length - 12} onClick={ handlePositionChange(1) }>
                        Next<RightIcon />
                    </Button>
                </div>
            }
        >
            <div style={{ height: '400px' }}>
                {
                    (proposalGroups) ? (
                        <ResponsiveBar
                            data={ proposalGroups.slice(currentPosition, currentPosition + 12) }
                            keys={ ['count'] }
                            indexBy="label"
                            layout='vertical'
                            margin={{ top: 0, left: 0, right: 0, bottom: 100 }}
                            height={ 400 }
                            colors={ theme.palette.chartColors }
                            colorBy='date'
                            // colorBy='index'
                            // maxValue={ Math.max(...proposalGroups.map(({ count }) => count)) }
                            borderColor='inherit:darker(1.6)'
                            axisBottom={{
                                tickSize: 5,
                                tickPadding: 5,
                                tickRotation: -90,
                                legend: '',
                                legendPosition: 'middle',
                                legendOffset: 0
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
                        />
                    ) : <CircularLoader />
                }
            </div>
        </Widget>
    )
}

export default proposalsByMonth