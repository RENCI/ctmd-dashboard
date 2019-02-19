import React, { Fragment } from 'react'
import { ResponsiveCalendar } from '@nivo/calendar'
import { Card, CardHeader, CardContent, Button } from '@material-ui/core'

const tooltip = (event) => {
    const { day, value } = event
    return (
        <Fragment>
            <div><strong>{ day }</strong></div>
            <div>{ value } Proposal{ value > 1 ? 's' : null }</div>
        </Fragment>
    )
}

const calendar = (props) => {
    const { proposals, fromDate, toDate, colors } = props
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
                title={ `Proposal Submissions in ${ year }` }
                subheader={ `${ proposalsByDate.filter(({ day }) => day.includes(year)).reduce((sum, {value}) => sum + parseInt(value), 0) } Submissions` }
            />
            <CardContent style={{ height: '250px' }}>
                <ResponsiveCalendar
                    data={ proposalsByDate }
                    from={ `${ year }-01-01T12:00:00.000Z` }
                    to={ `${ year }-12-31T12:00:00.000Z` }
                    direction="horizontal"
                    emptyColor="#eee"
                    margin={{ top: 16, right: 16, bottom: 0, left: 32, }}
                    yearSpacing={ 40 }
                    monthBorderColor="#fff"
                    monthLegendOffset={ 10 }
                    dayBorderWidth={ 1 }
                    dayBorderColor="#fff"
                    tooltip={ tooltip }
                />
            </CardContent>
        </Card>
    )
}

export default calendar