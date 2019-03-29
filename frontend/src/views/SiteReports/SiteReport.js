import React from 'react'
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

const SiteReport = props => {
    const { open, closeHandler, study } = props
    const classes = useStyles()

    return (
        <Dialog maxWidth="md" scroll="body" open={ open } onClose={ closeHandler } className={ classes.dialog }>
            <DialogTitle disableTypography onClose={ closeHandler } className={ classes.dialogTitle }>
                { study } Site Report
            </DialogTitle>
            <DialogContent className={ classes.dialogContent }>
                <SiteReportEditor />
            </DialogContent>
            <DialogActions className={ classes.dialogActions }>
                <Button variant="outlined" color="secondary" onClick={ () => console.log('Edit...') }>Edit</Button>
                <Button variant="outlined" color="secondary" onClick={ () => console.log('Exporting to PDF...') }>Export</Button>
                <Button variant="contained" color="secondary" onClick={ closeHandler }>Close</Button>
            </DialogActions>
        </Dialog>
    )
}

export default SiteReport