import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import api from '../Api'
import { Title } from '../components/Typography'
import { CircularLoader } from '../components/Progress/Progress'
import { LookupTable } from '../components/Tables/LookupTable'
import { StoreContext } from '../contexts/StoreContext'

// XXX: Copying this from study list
const studiesIds = [171, 186]

export const SitesPage = (props) => {
    const [store, ] = useContext(StoreContext)
    const [sites, setSites] = useState([]])
    const [studySites, setStudySites] = useState([]);
    const [tableData, setTableData] = useState(null);

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

    useEffect(() => {
        if (store.proposals) {
            const studies = store.proposals.filter(({ proposalID }) => studiesIds.includes(proposalID))

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

    useEffect(() => {
      setTableData(sites.map(site => {
        const studies = studySites.filter(({ siteId }) => site.siteId === siteId)

        return studies.length === 0 ?
            { siteId: site.siteId, siteName: site.siteName } :
            studies.map(studySite => {
                return { siteId: site.siteId, siteName: site.siteName, studySite: studySite }
            })
      }).flat())
    }, [sites, studySites])

    return (
        <div>
            <Title>Sites</Title>

            { tableData ? <LookupTable data={ sites.map(site => ({ id: site.siteId, name: site.siteName })) } /> : <CircularLoader /> }

        </div>
    )
}
