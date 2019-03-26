import React, { useState, useContext, useEffect } from 'react'
import axios from 'axios'
import { makeStyles, useTheme } from '@material-ui/styles'
import { ApiContext } from '../contexts/ApiContext'
import {
    Grid, Card, CardHeader, CardContent, Button,
    List, ListItem, ListItemText,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Tabs,
} from '@material-ui/core'
import SiteReport from '../components/Forms/SiteReports/SiteReport'
import Heading from '../components/Typography/Heading'

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

const SiteReportPage = props => {
    const [sites, setSites] = useState(null)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [study, setStudy] = useState()
    const api = useContext(ApiContext)
    const classes = useStyles()
    const theme = useTheme()

    useEffect(() => {
        axios.get(api.sites)
            .then(response => {
                setSites(response.data)
            })
            .catch(error => console.log('Error', error))
    }, [])

    const handleSetStudy = event => {
        setStudy(event.currentTarget.value)
        handleOpenDialog()
    }

    const handleOpenDialog = () => { setDialogOpen(true) }
    const handleCloseDialog = () => { setDialogOpen(false) }

    const studies = ['STRESS', 'SPIRRIT', 'COVET']

    return (
        <div>
            <Heading>Site Report Card</Heading>

            <Grid container spacing={ 2 * theme.spacing.unit }>
                {
                    studies.map((study, i) => {
                        return (
                            <Grid item xs={ 12 } md={ 6 } lg={ 4 } key={ study }>
                                <Card className={ classes.card }>
                                    <CardHeader title={ study } className={ classes.cardHeader} />
                                    <CardContent className={ classes.cardContent }>
                                        <List>
                                            <ListItem>
                                                <ListItemText primary="Study Name" secondary={ study }/>
                                            </ListItem>
                                            <ListItem>
                                                <ListItemText primary="Prinipal Investigator" secondary="Jane Doe"/>
                                            </ListItem>
                                            <ListItem>
                                                <ListItemText primary="Study Coordinator" secondary="John Doe"/>
                                            </ListItem>
                                        </List>
                                        <Button key={ `${ study }-edit` } variant="contained" color="primary"
                                            className={ classes.openReportButton } onClick={ handleSetStudy } value={ study }
                                        >
                                            View Report
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        )
                    })
                }

            </Grid>

            <Dialog maxWidth="md" scroll="body" open={ dialogOpen } onClose={ handleCloseDialog } className={ classes.dialog }>
                <DialogTitle disableTypography onClose={ handleCloseDialog } className={ classes.dialogTitle }>
                    { study } Site Report
                </DialogTitle>
                <DialogContent className={ classes.dialogContent }>
                    <SiteReport />
                </DialogContent>
                <DialogActions className={ classes.dialogActions }>
                    <Button variant="outlined" color="secondary" onClick={ () => console.log('Saving...') }>Save</Button>
                    <Button variant="outlined" color="secondary" onClick={ () => console.log('Exporting to PDF...') }>Export</Button>
                    <Button variant="contained" color="secondary" onClick={ handleCloseDialog }>Close</Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default SiteReportPage