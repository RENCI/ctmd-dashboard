import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { makeStyles } from '@material-ui/styles'
import {
    Card, CardActionArea, CardHeader, CardContent, CardActions, Button,
} from '@material-ui/core'
import { ArrowDropDown as DropdownIcon, Add as AddIcon } from '@material-ui/icons'

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
        padding: theme.spacing.unit,
        display: 'flex',
        justifyContent: 'space-between',
    },
    button: {
        padding: `${ theme.spacing.unit }px ${ 2 * theme.spacing.unit }`,
    },
}))

const StudyCard = props => {
    const { proposal, siteSelectHandler } = props
    const [anchorEl, setAnchorEl] = useState(null)
    const [report, setReport] = useState(-1)
    const classes = useStyles()
    
    console.log(props.proposal)

    const handleSelectSiteReport = event => {
        console.log('Setting study and site report...')
        setReport(event.target.value)
    }
    
    const handleOpenMenu = event => setAnchorEl(event.currentTarget)
    const handleCloseMenu = () => setAnchorEl(null)
    const handleSelect = (event) => {
        siteSelectHandler(event)
        handleCloseMenu()
    }

    return (
        <Card className={ classes.card }>
            <CardHeader className={ classes.cardHeader } title={ proposal.shortTitle } subheader={ proposal.longTitle } />
            <CardContent className={ classes.cardContent }>
                <br/>
            </CardContent>
            <CardActions className={ classes.cardActions }>
                 <Button variant="contained" className={ classes.button }
                    component={ NavLink } to={ `/site-reports/${ proposal.proposalID }` }
                >
                    View Site Reports
                </Button>
                <Button variant="contained" color="secondary" className={ classes.button } onClick={ () => console.log('Add new site report...') }>
                    <AddIcon /> Add Site Report
                </Button>
            </CardActions>
        </Card>
    )
}

export default StudyCard