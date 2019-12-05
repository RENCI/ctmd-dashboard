import React from 'react'
import { ResponsiveBar } from '@nivo/bar'

export const EnrollmentBar = props => {
    const enrolled = +props.data[props.enrolledKey]
    const expected = +props.data[props.expectedKey]
    const percentEnrolled = expected === 0 ? 0 : Math.round(enrolled / expected * 100)

    const barTooltip = () => {
        return (
            <div style={{ width: 100 }}>
                <p>{enrolled + ' of ' + expected + ' enrolled: '}</p>
                <p>{percentEnrolled + '%'}</p>
            </div>
        )
    }

    return (
        <div style={{
                height: props.height,
                width: props.maxValue === 0 ? 0 : (expected / props.maxValue) * props.width,
                border: '2px solid ' + props.color,
                background: props.background
            }}
        >
            <ResponsiveBar
                data={ [props.data] }
                minValue={ 0 }
                maxValue={ expected }
                keys={ [props.enrolledKey] }
                colors={ [props.color] }
                colorBy='id'
                layout='horizontal'
                animate={ false }
                padding={ 0 }
                enableGridY={ false }
                tooltip={ barTooltip }
            />
        </div>
    )
}
