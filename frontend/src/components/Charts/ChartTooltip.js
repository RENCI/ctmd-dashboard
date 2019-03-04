import React from 'react'

const ChartTooltip = ({ color, id, value }) => {
    return (
        <div style ={{ display: 'flex', }}>
            <div style={{ display: 'inline', backgroundColor: color, width: '2.4rem', height: '2.4rem', marginRight: '0.5rem', }}>&nbsp;</div>
            <div style={{ flex: 1, lineHeight: '1.2rem', }}>
                <div><strong>{ id }</strong></div>
                <div>{ value } Proposal{ value !==  1 ? 's' : null }</div>
            </div>
        </div>
    )
}

export default ChartTooltip