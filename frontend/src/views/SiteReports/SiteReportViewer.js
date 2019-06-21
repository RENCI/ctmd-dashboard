import React, { useState, useContext, useEffect } from 'react'
import { makeStyles } from '@material-ui/styles'
import { StoreContext } from '../../contexts/StoreContext'
import { Card, CardHeader, CardContent, CardActions, Button } from '@material-ui/core'
import SiteReportEditor from '../../components/Forms/SiteReportEditor'

const useStyles = makeStyles(theme => ({
    card: {},
    cardTitle: {},
    cardContent: {
        // paddingTop: theme.spacing(2),
    },
    cardActions: {
        padding: theme.spacing(2),
    },
}))

const VIEW = 'VIEW'
const EDIT = 'EDIT'
// const EXPORT = 'EXPORT'

const SiteReportCard = props => {
    const { open, proposalID, siteID } = props
    const [store, ] = useContext(StoreContext)
    const [proposal, setProposal] = useState()
    const [reportMode, setReportMode] = useState(VIEW)
    const classes = useStyles()
    
    useEffect(() => {
        setProposal(store.proposals.find(proposal => proposal.proposalID === proposalID))
    }, [store.proposals, props.proposalID])

    const changeReportMode = event => setReportMode(event.currentTarget.value)
    
    return (
        <Card maxwidth="md" scroll="body" open={ open }  className={ classes.card }>
            <CardHeader
                title={ `Report Card for [Site Name] (#${ siteID })` }
                subheader={ proposal ? 'Proposal: ' + proposal.shortTitle : '' }
            />
            <CardContent className={ classes.cardContent }>
                { reportMode === VIEW && <SiteReportEditor readOnly={ true } /> }
                { reportMode === EDIT && <SiteReportEditor proposalID={ proposalID } readOnly={ false } /> }
            </CardContent>
            <CardActions className={ classes.cardActions }>
                <Button variant="outlined" color="secondary" value={ reportMode === VIEW ? EDIT : VIEW } onClick={ changeReportMode }>
                    { reportMode === VIEW ? 'Edit' : 'View' }
                </Button>
                <Button variant="outlined" color="secondary" onClick={ () => console.log('Exporting to PDF...') }>Export</Button>
            </CardActions>
        </Card>
    )
}

export default SiteReportCard