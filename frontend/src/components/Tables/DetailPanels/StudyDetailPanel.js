import React, { useState, useContext, useEffect } from 'react'
import axios from 'axios'
import api from '../../../Api'
import { Grid, Tooltip, IconButton, Divider } from '@material-ui/core'
import { SettingsContext, StoreContext } from '../../../contexts'
import { Info as ProfileIcon } from '@material-ui/icons'
import { Subheading, Subsubheading, Paragraph, Caption } from '../../../components/Typography'
import { NavLink } from 'react-router-dom'
import { SitesActivationPieChart } from '../../../components/Charts'
import { CircularLoader } from '../../Progress/Progress'
import {
    Description as ProposalIcon,
    DescriptionOutlined as ProposalOpenIcon,
    Assessment as ReportIcon,
    AssessmentOutlined as ReportOpenIcon,
} from '@material-ui/icons'
import { formatDate } from '../../../utils'
import { isSiteActive } from '../../../utils/sites'
import { DetailPanel } from './DetailPanel'

export const StudyDetailPanel = ({ proposalID, shortTitle }) => {
    const [store, ] = useContext(StoreContext)
    const [sites, setSites] = useState(null)

    // useEffect(() => {
    //     if (proposalID) {
    //         const studySites = store.sites.filter(site => site.proposalID == proposalID)
    //         setSites(studySites)
    //     }
    // }, [proposalID])

    useEffect(() => {
        const retrieveSites = async (proposalID) => {
            await axios.get(api.studyProfile(proposalID))
                .then(response => {
                    setSites(response.data['Sites'])
                })
                .catch(error => console.error(error))
        }
        if (store.proposals) {
            try {
                const proposal = store.proposals.find(proposal => proposal.proposalID == proposalID)
                retrieveSites(proposal.proposalID)
            } catch (error) {
                console.log(error)
            }
        }
    }, [store.proposals])

    const activeSitesCount = () => {
        const reducer = (count, site) => isSiteActive(site) ? count + 1 : count
        return sites.reduce(reducer, 0)
    }

    const activeSitesPercentage = () => 100 * (activeSitesCount() / sites.length).toFixed(2)
    
    const total = property => {
        const reducer = (count, site) => site[property] ? count + parseInt(site[property]) : count
        return sites.reduce(reducer, 0)
    }

    const earliestDate = property => {
        const dates = sites.filter(site => site[property] !== '')
                            .map(site => new Date(site[property]))
        const reducer = (earliest, thisDate) => earliest < thisDate ? earliest : thisDate
        const minDate = dates.reduce(reducer, new Date()) 
        return minDate
    }

    return (
        <DetailPanel heading={ shortTitle } subheading="Study Summary">
            {
                sites ? 
                    <Grid container>
                        <Grid item xs={ 3 }>
                            <Subsubheading align="center">Site Activation</Subsubheading>
                            <SitesActivationPieChart percentage={ activeSitesPercentage() } />
                            <Caption align="center">
                                { activeSitesCount() } of { sites.length } sites
                            </Caption>
                        </Grid>
                        <Grid item xs={ 5 }>
                            <Paragraph>
                                Patient Counts
                            </Paragraph>
                            <ul>
                                <li>Consented: { total('patientsConsentedCount') }</li>
                                <li>Expected: { total('patientsExpectedCount') }</li>
                                <li>Withdrawn: { total('patientsWithdrawnCount') }</li>
                                <li>Enrolled: { total('patientsEnrolledCount') }</li>
                            </ul>
                        </Grid>
                        <Grid item xs={ 4 }>
                            <Paragraph>
                                Notable Dates
                            </Paragraph>
                            <ul>
                                <li>First Activation: { formatDate(earliestDate('dateSiteActivated')) }</li>
                                <li>First IRB Submission: { formatDate(earliestDate('dateIrbSubmission')) }</li>
                                <li>First IRB Approval:  { formatDate(earliestDate('dateIrbApproval')) }</li>
                            </ul>
                        </Grid>
                        <Grid item xs={ 12 } style={{ textAlign: 'right' }}>
                            <Tooltip title="Detailed Study Report" placement="bottom">
                                <IconButton aria-label="View Detailed Report" size="large" component={ NavLink } to={ `/studies/${ proposalID }` }>
                                    <ReportIcon style={{ fontSize: 24 }} />
                                </IconButton>
                            </Tooltip>
                        </Grid>
                    </Grid>
                : <CircularLoader />
            }
        </DetailPanel>
    )
}

