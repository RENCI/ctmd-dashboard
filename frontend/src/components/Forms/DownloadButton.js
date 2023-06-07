import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { IconButton, Tooltip } from '@material-ui/core'
import { CSVIcon } from '../Icons/Csv'
import { AuthContext } from '../../contexts'

export const DownloadButton = ({ path, tooltip = 'Download' }) => {
  const { isPLAdmin } = useContext(AuthContext)

  const shouldRender = process.env.NODE_ENV === 'development' || (process.env.REACT_APP_IS_HEAL_SERVER !== 'true' || isPLAdmin)
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
