import React from 'react'
import { ResponsiveCalendar } from '@nivo/calendar'

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
                "top": 100,
                "right": 30,
                "bottom": 60,
                "left": 30
            }}
            yearSpacing={ 40 }
            monthBorderColor="#ffffff"
            monthLegendOffset={ 10 }
            dayBorderWidth={ 1 }
            dayBorderColor="#ffffff"
        />
    )
}

export default calendar