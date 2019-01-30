import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import MetricsForm from '../components/Forms/Metrics'
import Heading from '../components/Typography/Heading'

const styles = (theme) => ({
    root: { },
})

const metricsPage = (props) => {
    const { classes } = props
    return (
        <div className={ classes.root }>
        
            <Heading>Metrics</Heading>

            <MetricsForm />
        </div>
    )
}

export default withStyles(styles)(metricsPage)