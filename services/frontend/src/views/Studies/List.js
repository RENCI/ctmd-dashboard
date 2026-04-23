import React, { Fragment, useContext, useEffect, useState } from 'react'
import api from '../../Api'
import { Title, Subsubheading, Paragraph } from '../../components/Typography'
import { StudiesTable } from '../../components/Tables'
import { Grid, List, ListItem, ListItemText } from '@material-ui/core'
import { DropZone, DownloadButton as TemplateDownload, StudiesDownloadForm, SiteMetricsDownload } from '../../components/Forms'
import { DataUploadHelper } from '../../components/Helper'
import { useProposals } from '../../hooks'

export const StudiesListPage = (props) => {
  const proposals = useProposals()
  const [studies, setStudies] = useState([])

  useEffect(() => {
    if (proposals) {
      const proposalsWithProfiles = proposals.filter((proposal) => proposal.profile && true)
      setStudies(proposalsWithProfiles)
    }
  }, [proposals])

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
