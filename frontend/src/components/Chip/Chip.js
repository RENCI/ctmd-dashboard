import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import Tooltip from '../Tooltip/Tooltip'
import { Chip } from '@material-ui/core'

const styles = (theme) => ({
    chip: {
        cursor: 'pointer',
        backgroundColor: theme.palette.primary.light,
        color: theme.palette.common.white,
        fontWeight: 'bold',
        margin: '3px',
        minWidth: '50px',
        transition: 'background-color 250ms',
        '&:hover': {
            backgroundColor: theme.palette.extended.persimmon,
        },
    },
})

const chip = (props) => {
    const { classes, proposal } = props
    return (
        <Tooltip proposal={ proposal }>
            <Chip label={ proposal.short_name } className={ classes.chip }/>
        </Tooltip>
    )
}

export default withStyles(styles)(chip)