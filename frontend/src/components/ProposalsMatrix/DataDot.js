import React from 'react'
import { withStyles } from '@material-ui/core/styles'

const radius = 10

const styles = (theme) => ({
    root: {
        cursor: 'pointer',
        fill: theme.palette.primary.light,
        margin: radius / 5,
        transition: 'fill 250ms',
        '&:hover': {
            fill: theme.palette.primary.main,
        },
        stroke: 'none',
    },
    circle: {
    }
})

const dataDot = (props) => {
    const { classes, proposal, color } = props
    return (
        <svg height={ 2 * radius } width={ 2 * radius } className={ classes.root }>
            <circle cx={ radius } cy={ radius } r={ radius } className={ classes.dot }/>
            <text x="0" y="15" fill="#000">{ proposal.proposal_id }</text>
        </svg>
    )
}

export default withStyles(styles)(dataDot)