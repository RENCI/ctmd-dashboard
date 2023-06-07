import React, { useContext, useEffect, useState } from 'react'
import { StoreContext } from '../../contexts/StoreContext'
import api from '../../Api'
import { Title } from '../../components/Typography'
import { StudiesTable } from '../../components/Tables'
import { Grid } from '@material-ui/core'
import { DropZone, DownloadButton as TemplateDownload, StudiesDownloadForm, SiteMetricsDownload } from '../../components/Forms'

export const StudiesListPage = (props) => {
  const [store] = useContext(StoreContext)
  const [studies, setStudies] = useState([])

  useEffect(() => {
    if (store.proposals) {
      const proposalsWithProfiles = store.proposals.filter((proposal) => proposal.profile && true)
      setStudies(proposalsWithProfiles)
    }
  }, [store.proposals])

  return (
    <div>
      <Grid container>
        <Grid item xs={12} md={4}>
          <Title>Studies</Title>
        </Grid>
        <Grid item xs={12} md={8}  style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem' }}>
          <TemplateDownload path={api.download('study-profile')} tooltip="Download Study Profile CSV Template" />
          <DropZone endpoint={api.uploadStudyProfile} method="POST" />
          <StudiesDownloadForm />
          <SiteMetricsDownload />
        </Grid>
      </Grid>

      <StudiesTable studies={studies} paging={true} />
    </div>
  )
}
