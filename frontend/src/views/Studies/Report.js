import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import api from '../../Api'
import { useTheme } from '@material-ui/styles'
import { StoreContext } from '../../contexts/StoreContext'
import { Grid, Card, CardHeader, CardContent, Button, IconButton } from '@material-ui/core'
import { List, ListItem, ListItemText } from '@material-ui/core'
import { Title, Subsubheading, Caption } from '../../components/Typography'
import { CircularLoader } from '../../components/Progress/Progress'
import { SitesTable } from '../../components/Tables'
import { isSiteActive } from '../../utils/sites'
import { SitesActivationPieChart } from '../../components/Charts'
import StudyEnrollment from '../../components/Visualizations/StudyEnrollmentContainer'
import { CollapsibleCard } from '../../components/CollapsibleCard'
import { SitesReport } from './SitesReport'
import { formatDate } from '../../utils'
import { FileDrop } from '../../components/Forms'
import { DropZone } from '../../components/Forms'
import { CloudUpload as UploadIcon } from '@material-ui/icons'

Array.prototype.chunk = function(size) {
    var chunks = []
    for (var i = 0; i < this.length; i += size) {
        chunks.push(this.slice(i,i + size))
    }
    return chunks
}

const Milestones = ({ sites }) => {
    const [patientCounts, setPatientCounts] = useState({ consented: 0, enrolled: 0, withdrawn: 0, expected: 0})
    const [firstIRBApprovedDate, setFirstIRBApprovedDate] = useState()
    const [firstSiteActivationDate, setFirstSiteActivationDate] = useState()
    const [firstSubjectEnrolled, setFirstSubjectEnrolled] = useState()
    const [siteActivationPercentages, setSiteActivationPercentages] = useState([null, null, null, null])

    const earliestDate = property => {
        const reducer = (earliestDate, date) => date < new Date(earliestDate) ? date : earliestDate
        const earliestDate = sites.map(site => site[property])
            .filter(date => date !== '')
            .map(date => new Date(date))
            .reduce(reducer, new Date())
        return formatDate(earliestDate)
    }

    const thresholds = property => {
        const quartileSize = Math.round(sites.length / 4)
        const activationDates = sites.map(site => site[property])
            .filter(date => date !== '')
            .map(date => new Date(date))
            .sort((d1, d2) => d1 > d2)
        const dates = activationDates.chunk(quartileSize).map(chunk => formatDate(chunk[chunk.length - 1]))
        for (let i = 0; i < 4; i++) {
            if (!dates[i]) { dates[i] = 'N/A' }
        }
        setSiteActivationPercentages(dates)
    }

    useEffect(() => {
        setFirstIRBApprovedDate(earliestDate('dateIrbApproval'))
        setFirstSiteActivationDate(earliestDate('dateSiteActivated'))
        setFirstSubjectEnrolled(earliestDate('fpfv'))
        thresholds('dateSiteActivated')
    }, [sites])

    const activeSitesCount = () => {
        const reducer = (count, site) => isSiteActive(site) ? count + 1 : count
        return sites.reduce(reducer, 0)
    }

    const activeSitesPercentage = () => 100 * (activeSitesCount() / sites.length).toFixed(2)

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

    return (
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
                <List dense>
                    <ListItem>
                        <ListItemText primary="First IRB Approved" secondary={ firstIRBApprovedDate } />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="First Site Activated" secondary={ firstSiteActivationDate } />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="First Subject Enrolled" secondary={ firstSubjectEnrolled } />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="25% Enrolled" secondary={ siteActivationPercentages[0] } />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="50% Enrolled" secondary={ siteActivationPercentages[1] } />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="75% Enrolled" secondary={ siteActivationPercentages[2] } />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="100% Enrolled" secondary={ siteActivationPercentages[3] } />
                    </ListItem>
                </List>
            </CardContent>
        </Card>
    )
}

export const StudyReportPage = props => {
    const proposalId = props.match.params.proposalID
    const [store, ] = useContext(StoreContext)
    const [study, setStudy] = useState(null)
    const [studySites, setStudySites] = useState(null)
    const [studyProfile, setStudyProfile] = useState(null)
    const [allSites, setAllSites] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const theme = useTheme()
    
    useEffect(() => {
        const retrieveStudyProfile = async (proposalID) => {
            await axios.get(api.studyProfile(proposalID))
                .then(response => setStudyProfile(response.data))
                .catch(error => {
                    console.log(error.response.data)
                    console.error(error)
                })
        }
        const retrieveStudySites = async (proposalID) => {
            await axios.get(api.studySites(proposalID))
                .then(response => setStudySites(response.data))
                .catch(error => console.error(error))
        }
        retrieveStudySites(proposalId)
        retrieveStudyProfile(proposalId)
        if (store.proposals) {
            try {
                const studyFromRoute = store.proposals.find(proposal => proposal.proposalID == proposalId)
                setStudy(studyFromRoute)
            } catch (error) {
                console.log(`Could not load study #${ proposalId }`, error)
            }
        }
    }, [store.proposals])

    useEffect(() => {
        const fetchAllSites = async () => {
            axios.get(api.sites)
                .then(response => setAllSites(response.data))
                .catch(error => console.error(error))
        }
        if (study && studySites) {
            fetchAllSites()
        }
    }, [study, studySites])

    useEffect(() => {
        if (allSites) {
            if (studySites) {
                studySites.forEach(site => {
                    const lookupSite = allSites.find(s => s.siteId === site.siteId)
                    if (lookupSite) {
                        site.siteName = lookupSite.siteName
                    }
                })
            }
            setIsLoading(false)
        }
    }, [allSites])

    return (
        <div>
            <Title>Study Report for { study && (study.shortTitle || '...') }</Title>
            
            <Grid container spacing={ 4 }>
                <Grid item xs={ 12 } sm={ 4 }>
                    <Card>
                        <CardHeader title="Upload Profile" />
                        <CardContent>
                            <DropZone endpoint={ api.uploadStudyProfile } />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={ 12 } sm={ 4 }>
                    <Card>
                        <CardHeader title="Upload Sites" />
                        <CardContent>
                            <DropZone endpoint={ api.uploadStudySites } />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={ 12 } sm={ 4 }>
                    <Card>
                        <CardHeader title="Upload Enrollment Data" />
                        <CardContent>
                            <DropZone endpoint={ api.uploadStudyEnrollmentData } />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {
                isLoading ? <CircularLoader />
                : (
                    <Grid container spacing={ 4 }>
                        <Grid item xs={ 12 }>
                            <Card>
                                <CardHeader title="Study Profile" subheader={ `${ study.shortTitle } ( #${ study.proposalID } )` } />
                                <CardContent>
                                    <pre>{ JSON.stringify(studyProfile, null, 2) }</pre>
                                </CardContent>
                            </Card>
                        </Grid>
                        
                        <Grid item xs={ 12 }>
                            <CollapsibleCard title="Overall Sites Report" subheader="According to the Coordinating Center Metrics">
                                <SitesReport sites={ studySites } />
                            </CollapsibleCard>
                        </Grid>
                        
                        <Grid item xs={ 12 }>
                            <SitesTable sites={ studySites } title={ `Sites for ${ study.shortTitle }` } paging={ true } />
                        </Grid>
                        
                        <Grid item xs={ 12 } sm={ 7 } md={ 8 } lg={ 9 }>
                            <Card>
                                <CardHeader title="Enrollment Graphic" />
                                <CardContent>
                                    <StudyEnrollment study={ study } sites={ studySites }/>
                                </CardContent>
                            </Card>
                        </Grid>
                        
                        <Grid item xs={ 12 } sm={ 5 } md={ 4 } lg={ 3 }>
                            <Card>
                                <CardHeader title="Milestones" />
                                <CardContent>
                                    Lorem ipsum dolor sit amet, consectetur.
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )
            }
        </div>
    )
}
