import React from 'react'
import { CircularProgress } from '@material-ui/core'

function CircularUnderLoad() {
    return <CircularProgress style={{ display: 'block', margin: 'auto' }} disableShrink />
}

export default CircularUnderLoad