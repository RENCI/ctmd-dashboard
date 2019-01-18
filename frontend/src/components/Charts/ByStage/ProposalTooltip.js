import React, { Fragment } from 'react'
import { withStyles } from '@material-ui/core/styles'
import { Tooltip } from '@material-ui/core'

const styles = (theme) => ({
    popper: {
        opacity: 1,
        backgroundColor: theme.palette.primary.light,
        borderRadius: '0.5rem',
        padding: '0.5rem',
        marginBottom: '0.5rem',
        '&::after': {
            backgroundColor: theme.palette.primary.light,
            content: '""',
            width: '1rem',
            height: '1rem',
            position: 'absolute',
            left: '50%',
            bottom: '-0.5rem',
            transform: 'translateX(-50%) rotate(45deg)',
        }
    },
    tooltip: {
        backgroundColor: theme.palette.primary.light,
        fontSize: '100%',
        position: 'relateive',
    },
    title: {
        borderBottom: '1px solid ' + theme.palette.common.white,
        textTransform: 'uppercase',
        marginBottom: '1rem',
    },
    body: {
    },
    bodyText: {
        lineHeight: '2rem',
    },
})

const proposalTooltip = withStyles(styles)((props) => {
    const { classes, children, proposal } = props
    const tooltipContent = (
        <Fragment>
            <div className={ classes.title }>Proposal { proposal.proposal_id}</div>
            <div className={ classes.body }>
                <div className={ classes.bodyText }>PI: { proposal.pi_name }</div>
                <div className={ classes.bodyText }>TIC: { proposal.tic_name }</div>
            </div>
        </Fragment>
    )
    return (
        <Tooltip interactive placement="top" title={ tooltipContent } classes={{ tooltip: classes.tooltip, popper: classes.popper }}>
            { children }
        </Tooltip>
    )
})

export default withStyles(styles)(proposalTooltip)