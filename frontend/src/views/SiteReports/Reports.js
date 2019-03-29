import React, { useState } from 'react'
import { makeStyles } from '@material-ui/styles'
import Heading from '../../components/Typography/Heading' 
import { List, ListItem, ListItemText, Button } from '@material-ui/core'
import SiteReportDialog from './SiteReport'

const useStyles = makeStyles(theme => ({
    card: {
        // ...theme.mixins.debug,
    },
    cardHeader: {
        flex: 1,
        borderWidth: '0 0 1px 0',
        border: `1px solid ${ theme.palette.grey[300] }`,
    },
    cardContent: {
        flex: 8,
        position: 'relative',
    },
    openReportButton: {
        marginTop: 2 * theme.spacing.unit,
        padding: theme.spacing.unit,
        position: 'absolute',
        right: 2 * theme.spacing.unit,
        bottom: 2 * theme.spacing.unit,
    },
    dialog: {},
    dialogTitle: {},
    dialogContent: {
        // paddingTop: 2 * theme.spacing.unit,
    },
    dialogActions: {
        padding: 2 * theme.spacing.unit,
    },
}))

const SiteReports = props => {
    const [study, setStudy] = useState()
    const [dialogOpen, setDialogOpen] = useState(false)
    const studies = ['Some', 'Sample', 'Studies']
    const classes = useStyles()
    
    const handleSetStudy = event => {
        setStudy(event.target.value)
        handleOpenDialog()
    }

    const handleOpenDialog = () => { setDialogOpen(true) }
    const handleCloseDialog = () => { setDialogOpen(false) }

    return (
        <div>
            <Heading>{ props.match.params.id } Site Reports</Heading>

            <List>
                {
                    studies.map(study => {
                        return (
                            <ListItem button key={ study } onClick={ handleSetStudy } value={ study }>
                                <ListItemText primary={ study }/>
                            </ListItem>
                        )
                    })
                }
            </List>

            <SiteReportDialog open={ dialogOpen } study={ study } closeHandler={ handleCloseDialog }/>

        </div>
    )
}

export default SiteReports