import React, { Fragment } from 'react'
import { withStyles } from '@material-ui/core/styles'
import { Chip } from '@material-ui/core'
import ProposalTooltip from './ProposalTooltip'

const styles = (theme) => ({
    chip: {
        cursor: 'pointer',
        backgroundColor: theme.palette.primary.light,
        color: theme.palette.common.white,
        fontWeight: 'bold',
        margin: '3px',
        minWidth: '50px',
        transition: 'backgroundColor 250ms',
        '&:hover': {
            backgroundColor: theme.palette.primary.main,
        },
    },
})

const proposalChip = (props) => {
    const { classes, className, proposal } = props
    return (
        <ProposalTooltip proposal={ proposal }>
            <Chip label={ proposal.proposal_id } className={ classes.chip }/>
        </ProposalTooltip>
    )
}

export default withStyles(styles)(proposalChip)