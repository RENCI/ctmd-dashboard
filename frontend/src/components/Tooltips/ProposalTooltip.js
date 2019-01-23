import React, { Fragment } from 'react'
import { withStyles } from '@material-ui/core/styles'
import { Tooltip } from '@material-ui/core'
import ListItem from './ListItem'

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
        position: 'relative',
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

const proposalTooltip = (props) => {
    const { classes, children, proposal } = props
    const tooltipContent = (
        <Fragment>
            <div className={ classes.title }>Proposal { proposal.proposal_id}</div>
            <div className={ classes.body }>
                <ListItem title="PI" content={ proposal.pi_name }/>
                <ListItem twoLines title="Submitting Organization" content={ proposal.org_name }/>
                <ListItem title="Assigned TIC/RIC" content={ proposal.tic_name }/>
            </div>
        </Fragment>
    )
    return (
        <Tooltip interactive placement="top" title={ tooltipContent } classes={{ tooltip: classes.tooltip, popper: classes.popper }}>
            { children }
        </Tooltip>
    )
}

export default withStyles(styles)(proposalTooltip)