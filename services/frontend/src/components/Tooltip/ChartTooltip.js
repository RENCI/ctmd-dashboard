import React from 'react'

export const ChartTooltip = ({ color, id, value, children }) => {
    return (
        <div style ={{ display: 'flex', }}>
            <div style={{ display: 'inline', backgroundColor: color, width: '1rem', marginRight: '0.5rem', }}>&nbsp;</div>
            <div style={{ flex: 1, lineHeight: '1.2rem', }}>
                { children }
            </div>
        </div>
    )
}
