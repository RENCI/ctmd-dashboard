import React, { useState } from 'react'
import { makeStyles } from '@material-ui/styles'
import { Card, CardHeader, CardContent, CardActions, Button } from '@material-ui/core'
import SiteReportEditor from '../../components/Forms/SiteReportEditor'

const useStyles = makeStyles(theme => ({
    card: {},
    cardTitle: {},
    cardContent: {
        // paddingTop: 2 * theme.spacing.unit,
    },
    cardActions: {
        padding: 2 * theme.spacing.unit,
    },
}))

const VIEW = 'VIEW'
const EDIT = 'EDIT'
const EXPORT = 'EXPORT'

const SiteReportCard = props => {
    const { open, closeCardHandler, proposal, site } = props
    const [reportMode, setReportMode] = useState(VIEW)
    const classes = useStyles()

    const changeReportMode = event => setReportMode(event.currentTarget.value)
    
    console.log(props)

    return (
        <Card maxWidth="md" scroll="body" open={ open } onClose={ closeCardHandler } className={ classes.card }>
            <CardHeader disableTypography onClose={ closeCardHandler } className={ classes.cardTitle }>
                Site Report for { site }
            </CardHeader>
            <CardContent className={ classes.cardContent }>
                { reportMode === VIEW && <SiteReportEditor readOnly={ true } /> }
                { reportMode === EDIT && <SiteReportEditor proposalID={ proposal.proposalID } readOnly={ false } /> }
            </CardContent>
            <CardActions className={ classes.cardActions }>
                <Button variant="outlined" color="secondary" value={ reportMode === VIEW ? EDIT : VIEW } onClick={ changeReportMode }>
                    { reportMode === VIEW ? 'Edit' : 'View' }
                </Button>
                <Button variant="outlined" color="secondary" onClick={ () => console.log('Exporting to PDF...') }>Export</Button>
                <Button variant="contained" color="secondary" onClick={ closeCardHandler }>Close</Button>
            </CardActions>
        </Card>
    )
}

export default SiteReportCard