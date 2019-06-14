import React, { useState, useContext, useEffect } from 'react'
import { makeStyles, useTheme } from '@material-ui/styles'
import { StoreContext } from '../../contexts/StoreContext'
import {
    Grid, Card, CardHeader,
    Select, OutlinedInput,
    MenuItem,
    Fab, Tooltip
} from '@material-ui/core'
import { Heading } from '../../components/Typography/Typography'
import SiteReportViewer from './SiteReportViewer'
import { Add as AddIcon } from '@material-ui/icons'

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
        marginTop: theme.spacing(2),
        padding: theme.spacing(1),
    },
    dialog: {},
    dialogTitle: {},
    dialogContent: {
        // paddingTop: theme.spacing(2),
    },
    dialogActions: {
        padding: theme.spacing(2),
    },
}))

const SiteReportsPage = props => {
    const { match: { params } } = props
    const [store, ] = useContext(StoreContext)
    const [proposal, setProposal] = useState()
    const [currentReport, setCurrentReport] = useState(-1)
    const classes = useStyles()
    const theme = useTheme()

    useEffect(() => {
        if (store.proposals && props.match.params.id) {
            setProposal(store.proposals.find(proposal => proposal.proposalID === parseInt(params.id)))
        }
    }, [props.match.params.id, store])

    const handleChangeReport = event => {
        console.log(event.target.value)
        setCurrentReport(event.target.value)
    }

    const demoRandomReportCount = Math.floor(Math.random() * 9) + 1

    return (
        <div>
            <Heading>Site Reports</Heading>
            <Grid container spacing={ theme.spacing(2) }>
                <Grid item xs={ 12 }>
                    <Card xs={ 12 }>
                    <CardHeader
                        title={ proposal ? proposal.shortTitle : 'Site Reports' }
                        subheader={ `${ demoRandomReportCount } Site Reports` }
                        action={
                            <Tooltip title="Add a Site Report" placement="left">
                                <Fab color="secondary" aria-label="Add" className={classes.fab} onClick={ () => console.log('Add new site report...') }>
                                    <AddIcon />
                                </Fab>
                            </Tooltip>
                        }
                    />
                        <Select
                            value={ currentReport }
                            onChange={ handleChangeReport }
                            input={ <OutlinedInput fullWidth labelWidth={ 0 } name="site" id="site" style={{ marginTop: '16px' }}/> }
                        >
                            <MenuItem value="-1">-</MenuItem>
                            { [...Array(demoRandomReportCount).keys()].map(i => <MenuItem key={ i } value={ i } onClick={ handleChangeReport }>Sample Site { i }</MenuItem>) }
                        </Select>
                    </Card>
                </Grid>
                <Grid item xs={ 12 }>
                    {
                        currentReport >= 0
                        ? <SiteReportViewer proposalID={ proposal.proposalID } siteID={ Math.floor(Math.random() * 100) + 10 } />
                        : null
                    }
                </Grid>
            </Grid>
        </div>
    )
}

export default SiteReportsPage