import React from 'react'
import Heading from '../../components/Typography/Heading' 
import { List, ListItem, ListItemText } from '@material-ui/core'

const SiteReports = props => {

    const studies = ['Some', 'Sample', 'Studies']

    return (
        <div>
            <Heading>{ props.match.params.id } Site Reports</Heading>

            <List>
                {
                    studies.map(study => {
                        return (
                            <ListItem key={ study }>
                                <ListItemText primary={ study }/>
                            </ListItem>
                        )
                    })
                }
            </List>
        </div>
    )
}

export default SiteReports