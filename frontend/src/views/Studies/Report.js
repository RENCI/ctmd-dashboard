import React, { useContext, useEffect, useState } from 'react'
import { useTheme } from '@material-ui/styles'
import { StoreContext } from '../../contexts/StoreContext'
import { Grid, Card, CardHeader, CardContent } from '@material-ui/core'
import { List, ListItem, ListItemText } from '@material-ui/core'
import { Title, Subsubheading, Caption } from '../../components/Typography'
import { CircularLoader } from '../../components/Progress/Progress'
import { SitesTable } from '../../components/Tables'
import { isSiteActive } from '../../utils/sites'
import { SitesActivationPieChart } from '../../components/Charts'
import StudyEnrollment from '../../components/Visualizations/StudyEnrollmentContainer'
import { CollapsibleCard } from '../../components/CollapsibleCard'
import { SitesReport } from './SitesReport'

export const StudyReportPage = props => {
    const [store, ] = useContext(StoreContext)
    const [study, setStudy] = useState(null)
    const [sites, setSites] = useState(null)
    const [patientCounts, setPatientCounts] = useState({ consented: 0, enrolled: 0, withdrawn: 0, expected: 0})
    const theme = useTheme()

    useEffect(() => {
        if (store.proposals) {
            try {
                const studyFromRoute = store.proposals.find(proposal => proposal.proposalID == props.match.params.proposalID)
                const studySites = store.sites.filter(site => site.proposalID == props.match.params.proposalID)
                setStudy(studyFromRoute)
                setSites(studySites)
            } catch (error) {
                console.log(error)
            }
        }
    }, [store.proposals])

    useEffect(() => {
        if (sites) {
            const reducer = (counts, site) => {
                const { patientsConsentedCount, patientsEnrolledCount, patientsWithdrawnCount, patientsExpectedCount } = site
                return ({
                    consented: counts.consented + parseInt(patientsConsentedCount || 0),
                    enrolled: counts.enrolled + parseInt(patientsEnrolledCount || 0),
                    withdrawn: counts.withdrawn + parseInt(patientsWithdrawnCount || 0),
                    expected: counts.expected + parseInt(patientsExpectedCount || 0),
                })
            }
            setPatientCounts(sites.reduce(reducer, patientCounts))
        }
    }, [sites])

    const activeSitesCount = () => {
        const reducer = (count, site) => isSiteActive(site) ? count + 1 : count
        return sites.reduce(reducer, 0)
    }

    const activeSitesPercentage = () => 100 * (activeSitesCount() / sites.length).toFixed(2)

    return (
        <div>
            <Title>Study Report for { study && (study.shortTitle || '...') }</Title>

            {
                study && sites ? (
                    <Grid container spacing={ 4 }>
                        <Grid item xs={ 12 }>
                            <Card>
                                <CardHeader
                                    title="Aggregate Sites Report"
                                    subheader="According to the Ten Metrics"
                                />
                                <CardContent>
                                    { sites ? <SitesReport sites={ sites } /> : <CircularLoader /> }
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={ 12 }>
                            <SitesTable sites={ sites } title={ `Sites for ${ study.shortTitle }` } paging={ true } />
                        </Grid>
                        <Grid item xs={ 12 } sm={ 7 } md={ 8 } lg={ 9 }>
                            <Card>
                                <CardHeader title="Enrollment Graphic" />
                                <CardContent>
                                    <StudyEnrollment study={ study } sites={ sites }/>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={ 12 } sm={ 5 } md={ 4 } lg={ 3 }>
                            <Card>
                                <CardHeader title="Milestones"/>
                                <CardContent>
                                    <Subsubheading align="center">Site Activation</Subsubheading>
                                    <SitesActivationPieChart percentage={ activeSitesPercentage() } />
                                    <Caption align="center">
                                        { activeSitesCount() } of { sites.length } sites
                                    </Caption>
                                </CardContent>
                                <CardContent>
                                    <Subsubheading align="center">Patient Counts</Subsubheading>
                                    <List dense>
                                        <ListItem>
                                            <ListItemText primary="Patients Consented" secondary={ patientCounts.consented }></ListItemText>
                                        </ListItem>
                                        <ListItem>
                                            <ListItemText primary="Patients Enrolled" secondary={ patientCounts.enrolled }></ListItemText>
                                        </ListItem>
                                        <ListItem>
                                            <ListItemText primary="Patients Withdrawn" secondary={ patientCounts.withdrawn }></ListItemText>
                                        </ListItem>
                                        <ListItem>
                                            <ListItemText primary="Patients Expected" secondary={ patientCounts.expected }></ListItemText>
                                        </ListItem>
                                    </List>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                ) : <CircularLoader />
            }
        </div>
    )
}
