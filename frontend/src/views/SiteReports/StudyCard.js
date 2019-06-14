import React from 'react'
import { NavLink } from 'react-router-dom'
import { makeStyles } from '@material-ui/styles'
import { Card, CardHeader, CardContent, CardActions, Button } from '@material-ui/core'

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
    cardActions: {
        padding: theme.spacing(1),
    },
    button: {
        padding: `${ theme.spacing(1) }px ${ theme.spacing(2) }`,
    },
}))

const StudyCard = props => {
    const { proposal } = props
    const classes = useStyles()

    return (
        <Card className={ classes.card }>
            <CardHeader className={ classes.cardHeader } title={ proposal.shortTitle } subheader={ proposal.longTitle } />
            <CardContent className={ classes.cardContent }>
                <br/>
            </CardContent>
            <CardActions className={ classes.cardActions }>
                 <Button variant="contained" color="secondary" className={ classes.button } size="large"
                    component={ NavLink } to={ `/site-reports/${ proposal.proposalID }` }
                >
                    View Site Reports
                </Button>
            </CardActions>
        </Card>
    )
}

export default StudyCard