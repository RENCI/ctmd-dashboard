import React, { useMemo } from 'react'
import { IconButton, Tooltip } from '@material-ui/core'
import { DownloadIcon } from '../Icons/Download'
import { useStore } from '../../contexts'
import { CSVLink } from 'react-csv'

export const StudiesDownloadForm = props => {
    const [{ proposals }, ] = useStore()

    const profiles = useMemo(() => {
        return proposals
            .filter(p => !!p.profile)
            .map(p => {
                const { profile, ...rest } = p
                return { ...rest, ...p.profile }
            })
    }, [proposals])

    return (
        <Tooltip title="Download studies" aria-label="Download studies">
            <IconButton
                component={ CSVLink }
                data={ profiles }
                separator=","
                filename="study-profiles"
            >
                <DownloadIcon />
            </IconButton>
        </Tooltip>
    )
}
