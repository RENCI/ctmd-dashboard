import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import { Chip } from '@material-ui/core'
import ProposalTooltip from '../../Tooltips/ProposalTooltip'

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

const proposalChip = (props) => {
    const { classes, proposal } = props
    return (
        <ProposalTooltip proposal={ proposal }>
            <Chip label={ proposal.proposal_id } className={ classes.chip }/>
        </ProposalTooltip>
    )
}

export default withStyles(styles)(proposalChip)