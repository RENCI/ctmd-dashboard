import React, { useState } from 'react'
import { makeStyles } from '@material-ui/styles'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@material-ui/core'
import SiteReportEditor from '../../components/Forms/SiteReportEditor'

const useStyles = makeStyles(theme => ({
    dialog: {},
    dialogTitle: {},
    dialogContent: {
        // paddingTop: 2 * theme.spacing.unit,
    },
    dialogActions: {
        padding: 2 * theme.spacing.unit,
    },
}))

const VIEW = 'VIEW'
const EDIT = 'EDIT'
const EXPORT = 'EXPORT'

const SiteReportDialog = props => {
    const { open, closeDialogHandler, proposal, site } = props
    const [reportMode, setReportMode] = useState(VIEW)
    const classes = useStyles()

    const changeReportMode = event => setReportMode(event.currentTarget.value)
    
    console.log(props)

    return (
        <Dialog maxWidth="md" scroll="body" open={ open } onClose={ closeDialogHandler } className={ classes.dialog }>
            <DialogTitle disableTypography onClose={ closeDialogHandler } className={ classes.dialogTitle }>
                Site Report for { site }
            </DialogTitle>
            <DialogContent className={ classes.dialogContent }>
                { reportMode === VIEW && <SiteReportEditor readOnly={ true } /> }
                { reportMode === EDIT && <SiteReportEditor proposalID={ proposal.proposalID } readOnly={ false } /> }
            </DialogContent>
            <DialogActions className={ classes.dialogActions }>
                <Button variant="outlined" color="secondary" value={ reportMode === VIEW ? EDIT : VIEW } onClick={ changeReportMode }>
                    { reportMode === VIEW ? 'Edit' : 'View' }
                </Button>
                <Button variant="outlined" color="secondary" onClick={ () => console.log('Exporting to PDF...') }>Export</Button>
                <Button variant="contained" color="secondary" onClick={ closeDialogHandler }>Close</Button>
            </DialogActions>
        </Dialog>
    )
}

export default SiteReportDialog