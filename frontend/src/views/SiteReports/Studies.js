import React, { useState, useContext, useEffect } from 'react'
import { Route, Switch, NavLink } from 'react-router-dom'
import axios from 'axios'
import { makeStyles, useTheme } from '@material-ui/styles'
import { ApiContext } from '../../contexts/ApiContext'
import {
    Grid, Card, CardHeader, CardContent, Button,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Tabs,
} from '@material-ui/core'
import Heading from '../../components/Typography/Heading'
import StudyCard from './StudyCard'
import SiteReportEditor from '../../components/Forms/SiteReportEditor'

const VIEW = 'VIEW'
const EDIT = 'EDIT'
const EXPORT = 'EXPORT'

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
    },
    openReportButton: {
        marginTop: 2 * theme.spacing.unit,
        padding: theme.spacing.unit,
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
    const [report, setReport] = useState()
    const [reportMode, setReportMode] = useState(VIEW)
    const api = useContext(ApiContext)
    const classes = useStyles()
    const theme = useTheme()

    useEffect(() => {
        axios.get(api.sites)
            .then(response => setSites(response.data))
            .catch(error => console.log('Error', error))
    }, [])

    const handleSetReport = event => {
        setReport(event.currentTarget.value)
        handleOpenDialog()
    }

    const handleOpenDialog = () => { setDialogOpen(true) }
    const handleCloseDialog = () => { setDialogOpen(false) }

    const changeReportMode = event => setReportMode(event.currentTarget.value)

    const studies = ['STRESS', 'SPIRRIT', 'COVET']
    
    return (
        <div>
            <Heading>Site Report Cards</Heading>

            <Grid container spacing={ 2 * theme.spacing.unit }>
                {
                    studies.map((study, i) => {
                        return (
                            <Grid item xs={ 12 } md={ 6 } lg={ 4 } key={ study }>
                                <StudyCard studyName={ study } reportSelectionHandler={ handleSetReport } />
                            </Grid>
                        )
                    })
                }

            </Grid>

            <Dialog maxWidth="md" scroll="body" open={ dialogOpen } onClose={ handleCloseDialog } className={ classes.dialog }>
                <DialogTitle disableTypography onClose={ handleCloseDialog } className={ classes.dialogTitle }>
                    Site Report
                </DialogTitle>
                <DialogContent className={ classes.dialogContent }>
                    { reportMode === VIEW && 'Viewer' }
                    { reportMode === EDIT && <SiteReportEditor /> }
                </DialogContent>
                <DialogActions className={ classes.dialogActions }>
                    <Button variant="outlined" color="secondary" value={ reportMode === VIEW ? EDIT : VIEW } onClick={ changeReportMode }>
                        { reportMode === VIEW ? 'Edit' : 'View' }
                    </Button>
                    <Button variant="outlined" color="secondary" onClick={ () => console.log('Exporting to PDF...') }>Export</Button>
                    <Button variant="contained" color="secondary" onClick={ handleCloseDialog }>Close</Button>
                </DialogActions>
            </Dialog>
            
        </div>
    )
}

export default SiteReportPage