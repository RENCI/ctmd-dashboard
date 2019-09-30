import React from 'react'
import { useTheme } from '@material-ui/styles'
import { Grid, Card, CardHeader, CardContent } from '@material-ui/core'
import { useProposal } from '../../hooks'
import { Title, Subheading, Paragraph } from '../../components/Typography'
import { CircularLoader } from '../../components/Progress/Progress'

const Detail = props => {
    const { name, info } = props
    return (
        <div>
            <Subheading>{ name }</Subheading>
            <Paragraph>{ info }</Paragraph>
            <br/>
        </div>
    )
}

export const ProposalReportPage = props => {
    const proposal = useProposal(props.match.params.id)
    const theme = useTheme()
    
    return proposal ? (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Title>
                    { proposal.shortTitle }
                </Title>
                <Subheading>
                    { proposal.proposalID }
                </Subheading>
            </div>
            
            <Grid container spacing="4">
                <Grid item xs={ 12 }>
                    <Card>
                        <CardHeader
                            title={ proposal.shortTitle }
                            subheader={ proposal.longTitle }
                        />
                        <CardContent>
                            <Detail name="Study Description" info={ proposal.shortDescription } />
                            <Detail name="Principal Investigator" info={ proposal.piName } />
                            <Detail name="Submission Date" info={ proposal.dateSubmitted } />
                            <Detail name="Proposal Status" info={ proposal.proposalStatus } />
                            <Detail name="Assigned TIC/RIC" info={ proposal.assignToInstitution } />
                            <Detail name="Submitting Institution" info={ proposal.submitterInstitution } />
                            <Detail name="Therapeutic Area" info={ proposal.therapeuticArea } />
                            <Detail name="Funding Status" info={ proposal.fundingStatus } />
                            <Detail name="Funding Status at Time of Approval" info={ proposal.fundingStatusWhenApproved } />
                            <Detail name="Total Budget" info={ proposal.totalBudget } />
                            <Detail name="Funding Duration" info={ proposal.fundingPeriod } />
                            <Detail name="PAT Meeting Date" info={ proposal.meetingDate } />
                            <Detail name="Planned Grant Submission Date" info={ proposal.plannedGrantSubmissionDate } />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </div>
    ) : <CircularLoader />
}
