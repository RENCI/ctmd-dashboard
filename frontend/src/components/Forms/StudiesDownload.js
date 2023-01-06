import React from 'react'
import { IconButton } from '@material-ui/core'
import { DownloadIcon } from '../Icons/Download'

export const StudiesDownloadForm = props => {
    const handleClickDownload = () => {
        console.log('download all studies')
    }

    return (
        <div>
            <IconButton onClick={ handleClickDownload }>
                <DownloadIcon />
            </IconButton>
        </div>
    )
}
