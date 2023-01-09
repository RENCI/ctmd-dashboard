import React, { useMemo } from 'react'
import { IconButton } from '@material-ui/core'
import { DownloadIcon } from '../Icons/Download'
import { useStore } from '../../contexts'

export const StudiesDownloadForm = props => {
    const [store, ] = useStore()

    const { proposals } = store
    const profiles = useMemo(() => {
        return proposals
            .filter(p => p.profile !== null)
            .map(p => p.profile)
    }, [store.proposals])

    const handleClickDownload = () => {
        console.log(profiles)
    }

    return (
        <div>
            <IconButton onClick={ handleClickDownload }>
                <DownloadIcon />
            </IconButton>
        </div>
    )
}
