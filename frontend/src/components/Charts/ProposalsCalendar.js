import React, { Fragment } from 'react'
import { ResponsiveCalendar } from '@nivo/calendar'

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
        <ResponsiveCalendar
            data={ proposals }
            from={ fromDate }
            to={ toDate }
            colors={ colors }
            direction="horizontal"
            emptyColor="#eeeeee"
            margin={{
                "top": 32,
                "right": 0,
                "bottom": 0,
                "left": 32,
            }}
            yearSpacing={ 40 }
            monthBorderColor="#ffffff"
            monthLegendOffset={ 10 }
            dayBorderWidth={ 1 }
            dayBorderColor="#ffffff"
            tooltip={ tooltip }
        />
    )
}

export default calendar