import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import api from '../Api'
import { groupBy } from '../utils/collections'
import { Title } from '../components/Typography'
import { CircularLoader } from '../components/Progress/Progress'
import { SitesEnrollmentTable } from '../components/Tables/SitesEnrollmentTable'
import { StoreContext } from '../contexts/StoreContext'
import { Grid } from '@material-ui/core'
import { DropZone } from '../components/Forms/DropZone'
import { DownloadButton } from '../components/Forms'
import { DataUploadHelper } from '../components/Helper'

export const SitesPage = (props) => {
  const [store] = useContext(StoreContext)
  const [sites, setSites] = useState([])
  const [studySites, setStudySites] = useState(null)
  const [tableData, setTableData] = useState(null)

    const fetchSites = async () => {
        await axios
            .get(api.sites, {withCredentials: true})
            .then((response) => {
                setSites(response.data)
            })
            .catch((error) => console.error(error))
    }

    const getProposalNames = () => {
        const proposals = store.proposals.filter((proposal) => proposal.profile && true)

        const names = {}
        proposals.forEach((study) => {
            names[study.proposalID] = study.shortTitle
        })

        return names
    }

    const fetchStudySites = () => {
        if (store.proposals) {
            const getStudySites = async () => {
                await axios.get(api.studySites(), {withCredentials: true})
                    .then(response => {
                        let grouppedBySiteId = groupBy(response.data, i => +i.siteId)
                        setStudySites(grouppedBySiteId)
                    })
                    .catch(err => console.log(err))
            }

            getStudySites()
        }
    }

    const getStudySiteRows = (site, studyNames) => {
        let tdata = []

        if(studySites.get(site.siteId)){
            let studies = studySites.get(site.siteId)

            for (const studySite of studies) {
                let enrolled = +studySite.patientsEnrolledCount
                let expected = studySite.patientsExpectedCount === null ? null : +studySite.patientsExpectedCount

                let percent = expected === null ? '' : Math.round((enrolled / expected) * 100)

                tdata.push({
                    id: site.siteId,
                    name: studySite.siteName,
                    studyName: studyNames[studySite.ProposalID],
                    enrolled: enrolled,
                    expected: expected,
                    percentEnrolled: percent,
                    ctsaId: site.ctsaId,
                })
            }
        }
        else{
            tdata.push({
                id: site.siteId,
                name: site.siteName,
                studyName: 'None',
                ctsaId: site.ctsaId,
            })
        }

        return tdata;
    }
    const setData = () => {
        if(!studySites)
            return

        let studyNames = getProposalNames()
        let tdata = []

        for (const site of sites) {
            let rows = getStudySiteRows(site, studyNames)
            tdata.push(...rows)
        }

        setTableData(tdata)
    }


    useEffect(() => {
        fetchSites()
    }, [])

    useEffect(() => {
        fetchStudySites()
    }, [store.proposals])

    useEffect(() => {
        setData()
    }, [sites, studySites])

  return (
    <div>
      <Grid container>
        <Grid item xs={11} md={6}>
          <Title>Sites</Title>
        </Grid>
        <Grid item xs={11} md={5}>
          <DropZone endpoint={api.uploadSites} method="POST" />
        </Grid>
        <Grid item xs={1} style={{ textAlign: 'right' }}>
          <DownloadButton path={api.download('sites')} tooltip="Download Sites CSV Template" />
          <DataUploadHelper />
        </Grid>
      </Grid>

      {tableData ? <SitesEnrollmentTable data={tableData} /> : <CircularLoader />}
    </div>
  )
}
