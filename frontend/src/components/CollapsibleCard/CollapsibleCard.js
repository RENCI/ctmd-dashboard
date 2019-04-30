import React, { useState } from 'react'
import { Card, CardHeader, CardContent, Collapse, IconButton } from '@material-ui/core'
import { ExpandMore as ExpandIcon } from '@material-ui/icons'

export const CollapsibleCard = ({ title, subheader, children }) => {
    const [expanded, setExpanded] = useState()

    const handleToggleExpand = () => { setExpanded(!expanded) }

    return (
        <Card>
            <CardHeader
                title={ title }
                subheader={ subheader }
                action={ <IconButton onClick={ handleToggleExpand }><ExpandIcon /></IconButton> }
            />
            <Collapse in={ expanded } timeout="auto" unmountOnExit >
                <CardContent>
                    { children }
                </CardContent>
            </Collapse>
        </Card>
    )
}
