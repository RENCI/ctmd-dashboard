import React from 'react'
import PropTypes from 'prop-types';
import { LinearProgress, CircularProgress } from '@material-ui/core'


export const CircularLoader = (props) => {
    return <CircularProgress style={{ display: 'block', margin: 'auto' }} disableShrink />
}

export const LinearLoader = (props) => {
    return (
        <div style={{ flexGrow: 1, margin: '3rem', }}>
          <LinearProgress />
        </div>
    )
}

