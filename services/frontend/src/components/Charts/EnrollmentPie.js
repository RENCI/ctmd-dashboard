import React from 'react'
import { ResponsivePie } from '@nivo/pie'
import { makeStyles, useTheme } from '@material-ui/styles'
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

export const EnrollmentPieChart = ({ percentage = 0 }) => {
  const classes = useStyles()
  const theme = useTheme()

  const data = [
    {
      'id': 'enrolled',
      'value': percentage,
    },
    {
      'id': 'not-enrolled',
      'value': 100 - percentage,
    },
  ]

  return (
    <div style={{ height: '150px' }} className={ classes.container }>
      <ResponsivePie
        height={ 150 }
        data={ data }
        colors={ [theme.palette.extended.eno, 'rgba(0, 0, 0, 0.05)'] }
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
