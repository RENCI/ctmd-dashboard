import React, { Fragment } from 'react'
import { withStyles } from '@material-ui/core/styles'
import { Tooltip } from '@material-ui/core'

const styles = (theme) => ({
    root: {},
    tooltipTitle: {
        fontSize: '150%',
    },
    tooltipTitle: {
        fontSize: '100%',
    },
})

const proposalTooltip = withStyles(styles)((props) => {
    const { classes, children, proposal } = props
    const tooltipContent = (
        <Fragment>
            <div className={ classes.tooltipTitle }>Proposal { proposal.proposal_id}</div>
            <hr/>
            <div className={ classes.tooltipBody }>PI: { proposal.pi_name }</div>
            <div className={ classes.tooltipBody }>TIC: { proposal.tic_name }</div>
        </Fragment>
    )
    return (
        <Tooltip placement="top" title={ tooltipContent }>
            { children }
        </Tooltip>
    )
})

export default withStyles(styles)(proposalTooltip)