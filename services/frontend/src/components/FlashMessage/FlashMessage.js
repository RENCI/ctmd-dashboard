import React from 'react'
import classnames from 'classnames'
import { makeStyles } from '@material-ui/styles'
import {
  Snackbar,
  SnackbarContent,
  IconButton,
} from '@material-ui/core'
import {
  Close as CloseIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
} from '@material-ui/icons'

const useStyles = makeStyles(theme => ({
  container: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    marginLeft: '74px',
    marginRight: '12px',
    display: 'flex',
    flexDirection: 'column-reverse',
    gap: theme.spacing(2),
    zIndex: 1400,
    maxHeight: '50vh',
    overflowY: 'auto',
    backgroundColor: '#0001',
    padding: theme.spacing(2),
  },
  snackbar: {
    position: 'relative',
    marginTop: theme.spacing(1),
    maxWidth: '100vw',
  },
  flashMessage: {
    borderRadius: theme.spacing(1),
    whiteSpace: 'pre-wrap',
    display: 'flex',
    alignItems: 'flex-start',
    width: '100%',
    border: '2px solid',
    color: '#222',
  },
  messageSpan: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing(2),
  },
  icon: {
    marginRight: theme.spacing(1),
    fontSize: 20,
  },
  messageSpanContent: {
    marginTop: '3px',
  },

  // variants
  success: {
    borderColor: theme.palette.flashMessage.success,
    backgroundColor: `color-mix(in hsl, ${theme.palette.flashMessage.success} 25%, #fff 75%)`,
  },
  info: {
    borderColor: theme.palette.flashMessage.info,
    backgroundColor: `color-mix(in hsl, ${theme.palette.flashMessage.info} 25%, #fff 75%)`,
  },
  warning: {
    borderColor: theme.palette.flashMessage.warning,
    backgroundColor: `color-mix(in hsl, ${theme.palette.flashMessage.warning} 25%, #fff 75%)`,
  },
  error: {
    borderColor: theme.palette.flashMessage.error,
    backgroundColor: `color-mix(in hsl, ${theme.palette.flashMessage.error} 25%, #fff 75%)`,
  },
}))

const ICONS = {
  success: SuccessIcon,
  info: InfoIcon,
  warning: WarningIcon,
  error: ErrorIcon,
}

const AUTO_HIDE = {
  success: 3000,
  info: 4000,
  warning: null,
  error: null,
}

export const FlashMessageContainer = ({
  messages = [],
  onClose,
  disableAutoHide = false,
}) => {
  const classes = useStyles()

  return (
    <div className={classes.container}>
      {messages.map(msg => (
        <FlashMessage
          key={msg.id}
          {...msg}
          open={true}
          onClose={onClose}
          disableAutoHide={disableAutoHide}
        />
      ))}
    </div>
  )
}

export const FlashMessage = ({
  id,
  messageType = 'info',
  messageText,
  open,
  onClose,
  disableAutoHide = false,
}) => {
  const classes = useStyles()
  const Icon = ICONS[messageType] || InfoIcon

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') return
    onClose?.(id)
  }

  return (
    <Snackbar
      className={classes.snackbar}
      open={open}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      autoHideDuration={
        disableAutoHide ? null : AUTO_HIDE[messageType]
      }
    >
      <SnackbarContent
        role='alert'
        className={classnames(
          classes.flashMessage,
          classes[messageType]
        )}
        message={
          <span className={classes.messageSpan}>
            <Icon className={classes.icon} />
            <span className={classes.messageSpanContent}>
              {messageText}
            </span>
          </span>
        }
        action={
          <IconButton
            aria-label='Close'
            color='inherit'
            onClick={handleClose}
          >
            <CloseIcon />
          </IconButton>
        }
      />
    </Snackbar>
  )
}