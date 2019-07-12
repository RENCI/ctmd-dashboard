import React, { Fragment, useContext, useEffect, useState } from 'react'
import { useTheme } from '@material-ui/styles'
import { StoreContext } from '../../contexts/StoreContext'
import { Grid, Card, CardHeader, CardContent } from '@material-ui/core'
import { Heading, Subheading } from '../../components/Typography/Typography'
import { CircularLoader } from '../../components/Progress/Progress'
import SitesTable from '../../components/Tables/SitesTable'

const StudyReportPage = props => {
    const [store, ] = useContext(StoreContext)
    const [study, setStudy] = useState(null)
    const [sites, setSites] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const theme = useTheme()

    useEffect(() => {
        if (store.proposals) {
            try {
                setIsLoading(true)
                const studyFromRoute = store.proposals.find(proposal => proposal.proposalID == props.match.params.proposalID)
                const studySites = store.sites.filter(site => site.proposalID == props.match.params.proposalID)
                console.log(store.sites)
                console.log(studySites)
                setStudy(studyFromRoute)
                setSites(studySites)
            } catch (error) {
                console.log(error)
            }
        }
    }, [store.proposals])

    return (
        <div>
            <Heading>Study Report for { study && study.shortTitle || '...' }</Heading>

            {
                study && sites ? (
                    <Grid container spacing={ theme.spacing(2) }>
                        <Grid item xs={ 12 }>
                            <SitesTable sites={ sites } title={ `Sites for ${ study.shortTitle }` } paging={ true } />
                        </Grid>
                        <Grid item xs={ 12 } md={ 8 }>
                            <Card>
                                <CardHeader title="Enrollment Graphic" />
                                <CardContent>
                                    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Laborum maxime aspernatur, perspiciatis modi, ad, repellat provident placeat libero itaque hic quod corrupti! Nobis facilis ducimus alias officiis, dignissimos, nemo eum.
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={ 12 } md={ 4 }>
                            <Card>
                                <CardHeader title="Milestones"/>
                                <CardContent>
                                    <ul>
                                        <li>one</li>
                                        <li>two</li>
                                        <li>three</li>
                                        <li>four</li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                ) : <CircularLoader />
            }
        </div>
    )
}

export default StudyReportPage