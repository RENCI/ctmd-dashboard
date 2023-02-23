import React, { useMemo } from 'react'
import { Button, Tooltip } from '@material-ui/core'
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
        <Tooltip title="Download study profiles" aria-label="Download study profiles">
            <Button
                component={ CSVLink }
                variant="outlined"
                data={ profiles }
                separator=","
                filename="study-profiles"
                startIcon={ <DownloadIcon /> }
            >Study profiles</Button>
        </Tooltip>
    )
}
