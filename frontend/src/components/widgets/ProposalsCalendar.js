import React, { Fragment, useContext, useState, useEffect } from 'react'
import { useTheme } from '@material-ui/styles'
import { Button, Menu, MenuItem } from '@material-ui/core'
import { KeyboardArrowDown as MoreIcon } from '@material-ui/icons'
import { ResponsiveCalendar } from '@nivo/calendar'
import { StoreContext } from '../../contexts/StoreContext'
import { CircularLoader } from '../Progress/Progress'
import Widget from './Widget'

const tooltip = (event) => {
    const { day, value } = event
    return (
        <Fragment>
            <div><strong>{ day }</strong></div>
            <div>{ value } Proposal{ value > 1 ? 's' : null }</div>
        </Fragment>
    )
}

const ProposalsCalendar = props => {
    const [store, ] = useContext(StoreContext)
    const [calendarData, setCalendarData] = useState()
    const [anchorEl, setAnchorEl] = React.useState(null)
    const [year, setYear] = useState((new Date()).getFullYear())
    const [count, setCount] = useState(0)
    const theme = useTheme()

    const handleClick = event => {
        setAnchorEl(event.currentTarget)
    }

    const handleSelect = event => {
        setYear(event.target.value);
        setAnchorEl(null)
    }
    
    const handleClose = () => {
        setAnchorEl(null)
    }

    useEffect(() => {
        if (store.proposals) {
            let data = [] // [ { day: 'YYYY-MM-DD', value: N }, ...]
            store.proposals.forEach(proposal => {
                const dateIndex = data.findIndex(({ day }) => day === proposal.dateSubmitted)
                if (dateIndex >= 0) {
                    data[dateIndex].value += 1
                } else {
                    data.push({ day: proposal.dateSubmitted || '', value: 1 })
                }
            })
            setCalendarData(data)
            setCount(data.filter(({ day }) => day && day.includes(year)).reduce((sum, { value }) => sum + value, 0))
        }
    }, [store])

    useEffect(() => {
        if (calendarData) {
            setCount(calendarData.filter(({ day }) => day && day.includes(year)).reduce((sum, { value }) => sum + value, 0))
        }
    }, [year])

    return (
        <Widget
            title={ `Submissions in ${ year }` }
            subtitle={ `${ count } Submissions` }
            action={
                <Fragment>
                    <Button variant="text" color="primary"
                        aria-owns={ anchorEl ? 'year-menu' : undefined }
                        aria-haspopup="true"
                        onClick={ handleClick }
                    >{ year }<MoreIcon/></Button>
                    <Menu id="year-menu" anchorEl={ anchorEl } open={ Boolean(anchorEl) } onClose={ handleClose }>
                        <MenuItem onClick={ handleSelect } value="2016">2016</MenuItem>
                        <MenuItem onClick={ handleSelect } value="2017">2017</MenuItem>
                        <MenuItem onClick={ handleSelect } value="2018">2018</MenuItem>
                        <MenuItem onClick={ handleSelect } value="2019">2019</MenuItem>
                    </Menu>
                </Fragment>
            }
            info="This allows you to visualize proposal submissions over time. Highlighted dates indicate dates on which proposals were submitted."
            footer={
                <svg width={ 70 + 14 * theme.palette.calendarColors.length } height="14">
                    <text x="0" y="10" fontSize="12" fill={ theme.palette.grey[800] }>fewer</text>
                    { theme.palette.calendarColors.map((color, i) => <rect key={ i } x={ 35 + i * 14 } y="0" width="14" height="14" fill={ color } />) }
                    <text x={ 35 + 14 * theme.palette.calendarColors.length + 5 } y="10" fontSize="12" fill={ theme.palette.grey[800] }>more</text>
                </svg>
            }
        >
            <div style={{ height: '180px' }}>
                {
                    calendarData ? (
                        <Fragment>
                            <ResponsiveCalendar
                                data={ calendarData }
                                from={ `${ year }-01-01T12:00:00.000Z` }
                                to={ `${ year }-12-31T12:00:00.000Z` }
                                direction="horizontal"
                                colors={ theme.palette.calendarColors }
                                emptyColor="#e9e9e9"
                                margin={{ top: 20, right: 16, bottom: 0, left: 32, }}
                                yearSpacing={ 40 }
                                monthBorderColor="#fff"
                                monthLegendOffset={ 10 }
                                dayBorderWidth={ 1 }
                                dayBorderColor="#fff"
                                tooltip={ tooltip }
                            />
                        </Fragment>
                    ) : <CircularLoader />
                }
            </div>
        </Widget>
    )
}

export default ProposalsCalendar