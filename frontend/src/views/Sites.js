import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import api from '../Api'
import { Title } from '../components/Typography'
import { CircularLoader } from '../components/Progress/Progress'
import { SitesEnrollmentTable } from '../components/Tables/SitesEnrollmentTable'
import { StoreContext } from '../contexts/StoreContext'
import { Grid } from '@material-ui/core'
import { DropZone } from '../components/Forms/DropZone'
import { DownloadButton } from '../components/Forms'
import { DataUploadHelper } from '../components/Helper'

export const SitesPage = (props) => {
    const [store, ] = useContext(StoreContext)
    const [studyNames, setStudyNames] = useState(null);
    const [sites, setSites] = useState([])
    const [studySites, setStudySites] = useState([]);
    const [tableData, setTableData] = useState(null);

    // Get sites
    useEffect(() => {
        const fetchSites = async () => {
            await axios.get(api.sites)
                .then(response => {
                  setSites(response.data)
                })
                .catch(error => console.error(error))
        }
        fetchSites()
    }, [])

    // Get study sites
    useEffect(() => {
        if (store.proposals) {
            const studies = store.proposals.filter(proposal => proposal.profile && true)

            const names = {}
            studies.forEach(study => {
              names[study.proposalID] = study.shortTitle
            })

            setStudyNames(names);

            const fetchStudyData = async (studies) => {
                await axios.all(
                  studies.map(study => axios.get(api.studySites(study.proposalID)))
                )
                .then(response => {
                    setStudySites(response.map(study => study.data).flat())
                })
            }

            fetchStudyData(studies)
        }
    }, [store.proposals])

    // Create table data
    useEffect(() => {
      setTableData(sites.map(site => {
        const studies = studySites.filter(({ siteId }) => site.siteId === siteId)

        return studies.length === 0 ? {
            id: site.siteId,
            name: site.siteName,
            studyName: "None"
        } : studies.map(studySite => {
            const enrolled = +studySite.patientsEnrolledCount
            const expected = +studySite.patientsExpectedCount
            const percent = expected === 0 ? 0 : enrolled / expected * 100;

            return {
                id: site.siteId,
                name: studySite.siteName,
                studyName: studyNames[studySite.ProposalID],
                enrolled: enrolled,
                expected: expected,
                percentEnrolled: Math.round(percent),
                ctsaId: site.ctsaId
            }
        })
      }).flat())
    }, [sites, studySites])

    return (
        <div>
            <Grid container>
                <Grid item xs={ 11 } md={ 6 }>
                    <Title>Sites</Title>
                </Grid>
                <Grid item xs={ 11 } md={ 5 }>
                    <DropZone endpoint={ api.uploadSites } method="POST" />
                </Grid>
                <Grid item xs={ 1 } style={{ textAlign: 'right' }}>
                    <DownloadButton path={ api.download('sites')} tooltip="Download Sites CSV Template" />
                    <DataUploadHelper />
                </Grid>
            </Grid>

            { tableData ? <SitesEnrollmentTable data={ tableData } /> : <CircularLoader /> }

        </div>
    )
}
