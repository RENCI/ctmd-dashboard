import React, { useState, useContext, useEffect } from 'react'
import { Route, Switch, NavLink } from 'react-router-dom'
import axios from 'axios'
import { makeStyles, useTheme } from '@material-ui/styles'
import { ApiContext } from '../../contexts/ApiContext'
import { StoreContext } from '../../contexts/StoreContext'
import {
    Grid, Card, CardHeader, CardContent, Button,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Tabs,
} from '@material-ui/core'
import Heading from '../../components/Typography/Heading'
import StudyCard from './StudyCard'
import SiteReportDialog from './SiteReportDialog'

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
    const [dialogOpen, setDialogOpen] = useState(false)
    const [site, setSite] = useState('some site')
    const [store, setStore] = useContext(StoreContext)
    const [reportMode, setReportMode] = useState(VIEW)
    const [studies, setStudies] = useState()
    const [proposal, setProposal] = useState()
    const api = useContext(ApiContext)
    const classes = useStyles()
    const theme = useTheme()
    
    useEffect(() => {
        if (store.proposals) {
            const ids = [186, 171, 196]
            setStudies(store.proposals.filter(proposal => ids.includes(proposal.proposalID)))
        }
    }, [store.proposals])

    const handleSelectStudy = event => {
        console.log(event.target.value)
        setProposal(store.proposals.find(proposal => proposal.proposalID === event.currentTarget.value))
    }
    const handleSelectStudyAndSite = event => {
        handleOpenDialog()
    }

    const handleOpenDialog = () => { setDialogOpen(true) }
    const handleCloseDialog = () => { setDialogOpen(false) }

    const changeReportMode = event => setReportMode(event.currentTarget.value)

    return (
        <div>
            <Heading>Site Report Cards</Heading>

            <Grid container spacing={ 2 * theme.spacing.unit }>
                {
                    studies ?
                    studies.map(study => {
                        return (
                            <Grid item xs={ 12 } md={ 6 } lg={ 4 } key={ study.proposalID }>
                                <StudyCard proposal={ study } siteSelectHandler={ handleSelectStudy } />
                            </Grid>
                        )
                    })
                    : null
                }
            </Grid>

            <SiteReportDialog open={ dialogOpen } closeDialogHandler={ handleCloseDialog } proposal={ proposal } site={ site }/>
            
        </div>
    )
}

export default SiteReportPage