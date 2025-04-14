import React, { useContext } from 'react'
import api from '../../Api'
import PropTypes from 'prop-types'
import { IconButton, Tooltip } from '@material-ui/core'
import { DropZone } from './DropZone'
import { CSVIcon } from '../Icons/Csv'
import { AuthContext } from '../../contexts'

export const DownloadButton = ({ path, tooltip = 'Download' }) => {
  const { isPLAdmin } = useContext(AuthContext)

  const shouldRender = isPLAdmin || process.env.NODE_ENV === 'development'

  if (!shouldRender) {
    return <span />
  }

  return (
    <Tooltip title={tooltip} aria-label={tooltip}>
      <IconButton aria-label="download template" component="a" href={path} download>
        <CSVIcon />
      </IconButton>
    </Tooltip>
  )
}

DownloadButton.propTypes = {
  path: PropTypes.string.isRequired,
  tooltip: PropTypes.string.isRequired,
}
