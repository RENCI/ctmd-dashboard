import React, { Fragment, useState } from 'react'
import { IconButton, Dialog, DialogTitle, DialogContent } from '@material-ui/core'
import { Info as InfoIcon } from '@material-ui/icons'
import { Subheading } from '../Typography'

export const Helper = ({ children }) => {
  const [open, setOpen] = useState(false)

  const handleClickOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  return (
    <Fragment>
      <IconButton
        aria-label="Instructions"
        onClick={ handleClickOpen }
      >
        <InfoIcon />
      </IconButton>
      <Dialog open={ open } onClose={ handleClose } aria-labelledby="instructions-dialog">
        <DialogTitle id="instructions-dialog"><Subheading>Instructions</Subheading></DialogTitle>
        <DialogContent>
          { children }
        </DialogContent>
      </Dialog>
    </Fragment>
  )
}
