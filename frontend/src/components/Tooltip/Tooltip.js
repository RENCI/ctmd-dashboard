import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import { Tooltip as MuiTooltip } from '@material-ui/core'
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
        fontWeight: 'bold',
    },
    body: {
    },
    bodyText: {
        lineHeight: '2rem',
    },
})

const tooltip = (props) => {
    const { classes, children, proposal } = props
    const tooltipContent = (
        <Fragment>
            <div className={ classes.title }>{ proposal.short_name } (#{ proposal.proposal_id })</div>
            <div className={ classes.body }>
                <ListItem title="PI" content={ proposal.pi_name }/>
                <ListItem twoLines title="Submitting Organization" content={ proposal.org_name }/>
                <ListItem title="Assigned TIC/RIC" content={ proposal.tic_name }/>
            </div>
        </Fragment>
    )
    return (
        <MuiTooltip interactive placement="top" title={ tooltipContent } classes={{ tooltip: classes.tooltip, popper: classes.popper }}>
            { props.children }
        </MuiTooltip>
    )
}

tooltip.propTypes = {
    children: PropTypes.element.isRequired
}

export default withStyles(styles)(tooltip)