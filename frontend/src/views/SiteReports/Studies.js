import React, { useState, useContext, useEffect } from 'react'
import { Route, Switch, NavLink } from 'react-router-dom'
import axios from 'axios'
import { makeStyles, useTheme } from '@material-ui/styles'
import { ApiContext } from '../../contexts/ApiContext'
import {
    Grid, Card, CardHeader, CardContent, Button,
    List, ListItem, ListItemText,
    Select, MenuItem, OutlinedInput,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Tabs,
} from '@material-ui/core'
import SiteReport from '../../components/Forms/SiteReports'
import Heading from '../../components/Typography/Heading'

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

            {
                studies.map(study => {
                    return (
                        <Button component={ NavLink} to={ `/site-reports/${ study }` } key={ study }>{ study }</Button>
                    )
                })
            }
            
        </div>
    )
}

export default SiteReportPage