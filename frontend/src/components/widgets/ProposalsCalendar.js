import React, { Fragment, useContext, useState, useEffect } from 'react'
import { useTheme } from '@material-ui/styles'
import { Card, CardHeader, CardContent, Button, Menu, MenuItem } from '@material-ui/core'
import { KeyboardArrowDown as MoreIcon } from '@material-ui/icons'
import { ResponsiveCalendar } from '@nivo/calendar'
import { StoreContext } from '../../contexts/StoreContext'
import { CircularLoader } from '../Progress/Progress'

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
    const [store, setStore] = useContext(StoreContext)
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
            setCount(data.filter(({ day }) => day && day.includes(year) || 0).reduce((sum, { value }) => sum + value, 0))
        }
    }, [store])

    useEffect(() => {
        if (calendarData) {
            setCount(calendarData.filter(({ day }) => day && day.includes(year) || 0).reduce((sum, { value }) => sum + value, 0))
        }
    }, [year])
    
    return (
        <Card>
            <CardHeader
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
                title={ `Submissions in ${ year }` }
                subheader={ `${ count } Submissions` }
            />
            <CardContent style={{ height: '180px' }}>
                {
                    calendarData ? (
                        <ResponsiveCalendar
                            data={ calendarData }
                            from={ `${ year }-01-01T12:00:00.000Z` }
                            to={ `${ year }-12-31T12:00:00.000Z` }
                            direction="horizontal"
                            colors={ theme.palette.chartColors }
                            emptyColor="#eee"
                            margin={{ top: 20, right: 16, bottom: 0, left: 32, }}
                            yearSpacing={ 40 }
                            monthBorderColor="#fff"
                            monthLegendOffset={ 10 }
                            dayBorderWidth={ 1 }
                            dayBorderColor="#fff"
                            tooltip={ tooltip }
                            domain={ [0, 5] }
                        />
                    ) : <CircularLoader />
                }
            </CardContent>
        </Card>
    )
}

export default ProposalsCalendar