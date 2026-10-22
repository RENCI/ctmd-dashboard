import React, { Fragment, useState, useRef } from 'react'
import { makeStyles } from '@material-ui/styles'
import { Card, CardHeader, CardActions, IconButton, CardContent, Dialog, DialogTitle, DialogContent, Tooltip } from '@material-ui/core'
import { Info as InfoIcon, GetApp as GetAppIcon } from '@material-ui/icons'
import { Paragraph } from '../Typography'
import { exportNodeAsPng } from '../../utils/exportImage'

const useStyles = makeStyles(theme => ({
    cardActions: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    infoButton: {
        color: theme.palette.grey[300],
        transition: 'color 250ms',
        '&:hover': {
            color: theme.palette.grey[700],
        }
    },
    exportButton: {
        color: theme.palette.grey[400],
        transition: 'color 250ms',
        '&:hover': {
            color: theme.palette.primary.main,
        }
    },
    dialogContent: {
        marginBottom: theme.spacing(4),
    }
}))

// `exportFilename` opts a widget into chart-image export (CTMD-190): a download
// button in the header saves the whole card (title + chart) as a high-res PNG.
export const Widget = props => {
    const { title, subtitle, action, info, footer, exportFilename, children } = props
    const [infoOpen, setInfoOpen] = useState(false)
    const [exporting, setExporting] = useState(false)
    const cardRef = useRef(null)
    const classes = useStyles()

    const handleClickOpen = () => setInfoOpen(true)
    const handleClose = () => setInfoOpen(false)

    const handleExport = async () => {
        setExporting(true)
        try {
            await exportNodeAsPng(cardRef.current, exportFilename)
        } catch (error) {
            console.error('Chart export failed:', error)
        } finally {
            setExporting(false)
        }
    }

    const exportButton = exportFilename ? (
        <Tooltip title="Export image (PNG)">
            <span data-export-ignore="true">
                <IconButton
                    aria-label="Export image"
                    data-export-ignore="true"
                    className={ classes.exportButton }
                    onClick={ handleExport }
                    disabled={ exporting }
                >
                    <GetAppIcon />
                </IconButton>
            </span>
        </Tooltip>
    ) : null

    const headerAction = (action || exportButton)
        ? <Fragment>{ action }{ exportButton }</Fragment>
        : undefined

    return (
        <Fragment>
            <Card style={{ height: '100%' }} ref={ cardRef }>
                <CardHeader
                    title={ title }
                    subheader={ subtitle }
                    action={ headerAction }
                    footer={ footer }
                />
                <CardContent>
                    { children }
                </CardContent>
                {
                    info || footer
                    ? (
                        <CardActions className={ classes.cardActions }>
                            <div>{ footer }</div>
                            {
                                info ? (
                                    <IconButton
                                        aria-label="Information"
                                        data-export-ignore="true"
                                        className={ classes.infoButton }
                                        onClick={ handleClickOpen }
                                    >
                                        <InfoIcon />
                                    </IconButton>
                                ) : null
                            }
                        </CardActions>
                    ) : null
                }
            </Card>
            {
                info
                ? (
                    <Dialog open={ infoOpen } onClose={ handleClose } aria-labelledby="information-dialog">
                        <DialogTitle id="information-dialog">Information</DialogTitle>
                        <DialogContent className={ classes.dialogContent }>
                            <Paragraph>
                                { info }
                            </Paragraph>
                        </DialogContent>
                    </Dialog>
                ) : null
            }
        </Fragment>
    )
}
