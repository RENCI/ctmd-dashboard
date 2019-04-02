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
    const { open, proposalID, siteID } = props
    const [reportMode, setReportMode] = useState(VIEW)
    const classes = useStyles()

    const changeReportMode = event => setReportMode(event.currentTarget.value)
    
    console.log(props)

    return (
        <Card maxWidth="md" scroll="body" open={ open }  className={ classes.card }>
            <CardHeader
                title={ `Site Report Card for ${ siteID }` }
                subheader={ 'Proposal ' + proposalID }
                action={
                    <div>
                        <Button variant="outlined" color="secondary" value={ reportMode === VIEW ? EDIT : VIEW } onClick={ changeReportMode }>
                            { reportMode === VIEW ? 'Edit' : 'View' }
                        </Button>
                        <Button variant="outlined" color="secondary" onClick={ () => console.log('Exporting to PDF...') }>Export</Button>
                    </div>
                }
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