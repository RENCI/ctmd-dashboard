import React from 'react'
import { makeStyles, useTheme } from '@material-ui/styles'
import { ChartTooltip } from '../Tooltip'
import { ResponsivePie } from '@nivo/pie'
import { Subheading } from '../Typography'

const useStyles = makeStyles(theme => ({
    container: {
        position: 'relative',
    },
    chart: {
        position: 'absolute',
        left: 0,
        top: 0,
    },
    overlay: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
}))

export const SitesActivationPieChart = ({ percentage }) => {
    const classes = useStyles()
    const theme = useTheme()

    const data = [
        {
            id: 'active',
            label: 'Active Sites',
            value: percentage,
        },
        {
            id: 'inactive',
            label: 'Inactive Sites',
            value: 100 - percentage,
        },
    ]

    return (
        <div style={{ height: '150px' }} className={ classes.container }>
            <ResponsivePie
                className={ classes.chart }
                height={ 150 }
                data={ data }
                tooltip={ ({ id, value, color, indexValue }) => (
                    <ChartTooltip color={ color }>
                        <strong>{ value }% { id.toUpperCase() }</strong>
                    </ChartTooltip>
                )}
                colors={ [theme.palette.chartColors[0], 'rgba(0, 0, 0, 0.05)'] }
                colorBy="id"
                margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                innerRadius={ 0.66 }
                padAngle={ 0.0 }
                cornerRadius={ 1 }
                borderWidth={ 1 }
                borderColor="inherit:darker(0.2)"
                enableRadialLabels={ false }
                enableSlicesLabels={ false }
                animate={ true }
                motionStiffness={ 90 }
                motionDamping={ 15 }
            />
            <div className={ classes.overlay }>
                <Subheading>
                    { percentage }%
                </Subheading>
            </div>
        </div>
    )
}
