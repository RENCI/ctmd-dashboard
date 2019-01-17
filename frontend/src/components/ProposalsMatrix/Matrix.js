import React from "react"
import classnames from 'classnames'
import { withStyles } from '@material-ui/core/styles'
import Subheading from '../Typography/Subheading'
import ProposalDot from './DataDot'

const styles = (theme) => ({
    root: {
        flexDirection: 'row',
        // ...theme.mixins.debug,
    },
    row: {
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid ' + theme.palette.grey[200],
        backgroundColor: 'transparent',
        transition: 'background-color 250ms',
        '&:hover': {
            backgroundColor: theme.palette.grey[200],
            '& $rowData': {
                opacity: 1,
            }
        }
    },
    columnHeading: {
        fontWeight: 'bold',
        fontFamily: theme.typography.heading,
    },
    rowLabel: {
        textAlign: 'right',
        verticalAlign: 'middle',
        minWidth: '300px',
        maxWidth: '300px',
        padding: theme.spacing.unit / 2,
    },
    rowData: {
        flex: 1,
        padding: theme.spacing.unit / 2,
        opacity: 0.69,
    },
})

const barGraph = (props) => {
    const { classes, theme } = props
    const stages = props.proposalsByStage
    return (
        <div className={ classes.root }>
            <div className={ classes.row }>
                <div className={ classnames(classes.rowLabel, classes.columnHeading) }>
                    <Subheading>Stage</Subheading>
                </div>
                <div className={ classnames(classes.rowData, classes.columnHeading) }>
                    <Subheading>Proposals</Subheading>
                </div>
            </div>
            {
                stages.map(stage => {
                    return (
                        <div className={ classes.row } key={ stage.name } >
                            <div className={ classes.rowLabel }>
                                { stage.name }
                            </div>
                            <div className={ classes.rowData }>
                                {
                                    stage.proposals.map(proposal => {
                                        return (
                                            <ProposalDot
                                                key={ `${stage.name}-${proposal.proposal_id}` }
                                                proposal={ proposal }
                                            />
                                        )
                                    })
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