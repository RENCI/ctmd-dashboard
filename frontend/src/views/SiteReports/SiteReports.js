import React, { useState, useContext, useEffect } from 'react'
import axios from 'axios'
import { makeStyles, useTheme } from '@material-ui/styles'
import { ApiContext } from '../../contexts/ApiContext'
import { StoreContext } from '../../contexts/StoreContext'
import {
    Grid, Card, CardHeader, CardContent, Button,
    Dialog, DialogTitle, DialogContent, DialogActions,
    FormControl, FormLabel, Select, OutlinedInput,
    List, ListItem, ListItemText,
    Menu, MenuItem,
    Tabs,
} from '@material-ui/core'
import Heading from '../../components/Typography/Heading'
import StudyCard from './StudyCard'
import SiteReportViewer from './SiteReportViewer'

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

const SiteReportsPage = props => {
    const { match: { params }} = props
    const [store, setStore] = useContext(StoreContext)
    const [proposal, setProposal] = useState()
    const [currentReport, setCurrentReport] = useState(-1)
    const classes = useStyles()
    const theme = useTheme()

    useEffect(() => {
        console.log(store)
        console.log(props.match.params.id)
        if (store.proposals && props.match.params.id) {
            setProposal(store.proposals.find(proposal => proposal.proposalID === parseInt(params.id)))
        }
    }, [props.match.params.id, store])

    const handleChangeReport = event => {
        console.log(event.target.value)
        setCurrentReport(event.target.value)
    }

    return (
        <div>
            <Heading>Site Reports: { proposal ? proposal.shortTitle : '...' }</Heading>
            <Grid container spacing={ 2 * theme.spacing.unit }>
                <Grid item xs={ 12 }>
                    <Card xs={ 12 }>
                    <CardHeader title="Select Site"/>
                        <Select
                            value={ currentReport }
                            onChange={ handleChangeReport }
                            input={ <OutlinedInput fullWidth labelWidth={ 0 } name="site" id="site" style={{ marginTop: '16px' }}/> }
                        >
                            <MenuItem value="-1">-</MenuItem>
                            { [0, 1, 2, 3, 4].map(i => <MenuItem key={ i } value={ i } onClick={ handleChangeReport }>Sample Site { i }</MenuItem>) }
                        </Select>
                    </Card>
                </Grid>
                <Grid item xs={ 12 }>
                    {
                        currentReport >= 0
                        ? <SiteReportViewer
                            proposalID={ proposal.proposalID }
                            siteID={ 101 }
                        />
                        : null
                    }
                </Grid>
            </Grid>
        </div>
    )
}

export default SiteReportsPage