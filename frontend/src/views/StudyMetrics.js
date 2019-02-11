import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import StudyMetricsForm from '../components/Forms/Metrics'
import Heading from '../components/Typography/Heading'
import Paragraph from '../components/Typography/Paragraph'

const styles = (theme) => ({
    page: { },
})

const StudyMetricsPage = (props) => {
    const { classes } = props
    return (
        <div className={ classes.page }>
        
            <Heading>Study Metrics</Heading>
                        
            <StudyMetricsForm/>
            
        </div>
    )
}

export default withStyles(styles)(StudyMetricsPage)