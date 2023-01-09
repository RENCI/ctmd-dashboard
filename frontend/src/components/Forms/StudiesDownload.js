import React, { useMemo } from 'react'
import { IconButton } from '@material-ui/core'
import { DownloadIcon } from '../Icons/Download'
import { useStore } from '../../contexts'
import { CSVLink } from 'react-csv'

export const StudiesDownloadForm = props => {
    const [store, ] = useStore()

    const { proposals } = store
    const profiles = useMemo(() => {
        return proposals
            .filter(p => p.profile !== null)
            .map(p => p.profile)
    }, [store.proposals])

    return (
        <div>
            <IconButton
                component={ CSVLink }
                data={ profiles }
                separator=","
                filename="study-profiles"
            >
                <DownloadIcon />
            </IconButton>
        </div>
    )
}
