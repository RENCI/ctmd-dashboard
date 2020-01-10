import React, { useState } from 'react'
import { Card, CardHeader, CardContent, Collapse, IconButton } from '@material-ui/core'
import { ExpandMore as ExpandIcon } from '@material-ui/icons'
import { makeStyles } from '@material-ui/styles'

const useStyle = makeStyles(theme => ({
    cardContent: {
        position: 'relative',
    },
    actions: {
        position: 'absolute',
        top: 0,
        right: 0,
        padding: theme.spacing(2),
    }
}))

export const CollapsibleCard = ({ title, subheader, children, actions }) => {
    const [expanded, setExpanded] = useState()
    const classes = useStyle()
    const handleToggleExpand = () => { setExpanded(!expanded) }

    return (
        <Card>
            <CardHeader
                title={ title }
                subheader={ subheader }
                action={ <IconButton onClick={ handleToggleExpand }><ExpandIcon /></IconButton> }
            />
            <Collapse in={ expanded } timeout="auto" unmountOnExit >
                <CardContent className={ classes.cardContent }>
                    <div className={ classes.actions }>
                        { actions }
                    </div>
                    { children }
                </CardContent>
            </Collapse>
        </Card>
    )
}
