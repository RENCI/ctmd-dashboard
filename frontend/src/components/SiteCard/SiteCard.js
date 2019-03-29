import React, { useState } from 'react'
import { makeStyles } from '@material-ui/styles'
import {
    Card, CardHeader, CardContent, CardActions, Button,
    List, ListItem, ListItemText,
    Menu, MenuItem,
} from '@material-ui/core'

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
    button: {
        marginTop: 2 * theme.spacing.unit,
        padding: theme.spacing.unit,
    },
}))

const SiteCard = props => {
    const { studyName, reportSelectionHandler } = props
    const [anchorEl, setAnchorEl] = useState(null)
    const [report, setReport] = useState(-1)
    const classes = useStyles()

    const handleSelectSiteReport = event => {
        console.log('Setting study and site report...')
        setReport(event.target.value)
    }
    
    const handleClick = event => {
        setAnchorEl(event.currentTarget)
        reportSelectionHandler(event)
    }
    const handleClose = () => setAnchorEl(null)

    return (
        <Card className={ classes.card }>
            <CardHeader title={ studyName } className={ classes.cardHeader } />
            <CardContent className={ classes.cardContent }>
                <List>
                    <ListItem>
                        <ListItemText primary="Study Name" secondary={ studyName }/>
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="Prinipal Investigator" secondary="Jane Doe"/>
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="Study Coordinator" secondary="John Doe"/>
                    </ListItem>
                </List>
            </CardContent>
            <CardActions>
                 <Button variant="contained" color="primary"  className={ classes.button }
                    aria-owns={ anchorEl ? 'site-select-menu' : undefined }
                    aria-haspopup="true"
                    onClick={ handleClick }
                >
                    View Site Report
                </Button>
                <Menu id="site-select-menu" anchorEl={ anchorEl } open={ Boolean(anchorEl) } onClose={ handleClose }>
                    <MenuItem value="" onClick={ handleClose }><em>None</em></MenuItem>
                    { [0, 1, 2, 3, 4].map(i => <MenuItem key={ i } value={ i } onClick={ handleClose }>Site { i }</MenuItem>) }
                </Menu>
                <Button variant="contained" color="primary" className={ classes.button }
                    onClick={ () => console.log('Add new site report...') }
                >
                    Add Site Report
                </Button>
            </CardActions>
        </Card>
    )
}

export default SiteCard