import React from "react"
import classnames from 'classnames'
import { withStyles } from '@material-ui/core/styles'
import Subheading from '../Typography/Subheading'
import Chip from '../Chip/Chip'

const styles = (theme) => ({
    root: {
        flexDirection: 'row',
        // ...theme.mixins.debug,
    },
    row: {
        display: 'flex',
        borderBottom: '1px solid ' + theme.palette.grey[200],
        flexDirection: 'column',
        [theme.breakpoints.up('md')]: {
            flexDirection: 'row',
        },
    },
    hightlightRow: {
        backgroundColor: 'transparent',
        transition: 'background-color 250ms, opacity 250ms',
        opacity: 0.75,
        '&:hover': {
            opacity: 1,
        },
    },
    columnHeading: {
        fontWeight: 'bold',
        fontFamily: theme.typography.heading,
    },
    leftColumn: {
        textAlign: 'left',
        minWidth: '100%',
        maxWidth: '100%',
        transition: 'min-width 250ms, max-width 250ms',
        padding: theme.spacing.unit,
        [theme.breakpoints.up('md')]: {
            textAlign: 'right',
            minWidth: '300px',
            maxWidth: '300px',
        },
    },
    rightColumn: {
        flex: 1,
        padding: theme.spacing.unit,
    },
    rowLabel: {
        padding: 2 * theme.spacing.unit,
        verticalAlign: 'top',
    },
    rowData: {
        padding: theme.spacing.unit / 2,
    },
})

const barGraph = (props) => {
    const { classes } = props
    const stages = props.proposalsByStage
    return (
        <div className={ classes.root }>
            <div className={ classes.row }>
                <div className={ classnames(classes.leftColumn, classes.columnHeading) }>
                    <Subheading>Stage</Subheading>
                </div>
                <div className={ classnames(classes.rightColumn, classes.columnHeading) }>
                    <Subheading>Proposals</Subheading>
                </div>
            </div>
            {
                stages.map(stage => {
                    return (
                        <div className={ classnames(classes.row, classes.hightlightRow) } key={ stage.name } >
                            <div className={ classnames(classes.leftColumn, classes.rowLabel) }>
                                { stage.name }<br/>
                                <small>({ stage.proposals.length } Proposals)</small>
                            </div>
                            <div className={ classnames(classes.rightColumn, classes.rowData) }>
                                {
                                    stage.proposals.map(proposal => (
                                        <Chip key={ proposal.proposal_id } proposal={ proposal }/>
                                    ))
                                }
                            </div>
                        </div>
                    )
                })
            }
        </div>
    )
}

export default withStyles(styles, { withTheme: true })(barGraph)