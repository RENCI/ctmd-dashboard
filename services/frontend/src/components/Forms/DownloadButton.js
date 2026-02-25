import React from 'react'
import api from '../../Api'
import PropTypes from 'prop-types'
import { IconButton, Tooltip } from '@material-ui/core'
import { DropZone } from './DropZone'
import { CSVIcon } from '../Icons/Csv'
import { AuthContext } from '../../contexts'

export const DownloadButton = ({ path, tooltip = 'Download' }) => {
  const { isPLAdmin } = useContext(AuthContext)

  // Render if non-HEAL server or if pladmin on HEAL server
  const shouldRender = process.env.REACT_APP_IS_HEAL_SERVER !== 'true' || isPLAdmin
  if (!shouldRender) {
    return null
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
