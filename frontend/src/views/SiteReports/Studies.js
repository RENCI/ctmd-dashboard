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
import SiteCard from '../../components/SiteCard/SiteCard'
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

    const studies = ['STRESS', 'SPIRRIT', 'COVET']

    return (
        <div>
            <Heading>Site Report Card</Heading>

            <Grid container spacing={ 2 * theme.spacing.unit }>
                {
                    studies.map((study, i) => {
                        return (
                            <Grid item xs={ 12 } md={ 6 } lg={ 4 } key={ study }>
                                <SiteCard studyName={ study } reportSelectionHandler={ handleSetReport } />
                            </Grid>
                        )
                    })
                }

            </Grid>

            <SiteReportDialog open={ dialogOpen }/>
            
        </div>
    )
}

export default SiteReportPage