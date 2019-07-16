import React, { useEffect, useState } from 'react'
import { makeStyles, useTheme } from '@material-ui/styles'
import { Collapse, Grid, Divider } from '@material-ui/core'
import { Subheading, Subsubheading } from '../../../components/Typography'

const useStyles = makeStyles(theme => ({
    panel: {
        padding: `${ theme.spacing(2) }px ${ theme.spacing(4) }px`,
        backgroundColor: theme.palette.extended.hatteras,
    },
    header: {
        marginBottom: theme.spacing(2),
        alignItems: 'center',
    },
    title: {
        padding: `${ theme.spacing(2) }px 0`,
        color: theme.palette.secondary.main,
        fontWeight: 'bold',
        letterSpacing: '1px',
        display: 'block',
    },
}))

export const DetailPanel = ({ heading, subheading, children }) => {
    const [expanded, setExpanded] = useState(false)
    const classes = useStyles()

    useEffect(() => {
        setExpanded(true)
        return () => setExpanded(false)
    }, [])
    
    return (
        <Collapse in={ expanded }>
            <Grid container className={ classes.panel }>

                <Grid item xs={ 12 }>
                    <Subheading>{ heading }</Subheading>
                    <Subsubheading>{ subheading }</Subsubheading>
                </Grid>

                <Grid item component={ Divider } xs={ 12 } style={{ padding: 0 }}/>
                
                <Grid item xs={ 12 }>
                    { children }
                </Grid>
                
            </Grid>
        </Collapse>
    )
}
