import React, { Fragment, useContext, useEffect, useState } from 'react'
import { StoreContext } from '../../contexts/StoreContext'
import api from '../../Api'
import { Title, Subsubheading, Paragraph } from '../../components/Typography'
import { StudiesTable } from '../../components/Tables'
import { Grid, List, ListItem, ListItemText } from '@material-ui/core'
import { DropZone, DownloadButton as TemplateDownload, StudiesDownloadForm } from '../../components/Forms'
import { DataUploadHelper } from '../../components/Helper'

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
        <Grid item xs={12} md={7}>
          <Title>Studies</Title>
        </Grid>
        <Grid item xs={12} md={5}  style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <TemplateDownload path={api.download('study-profile')} tooltip="Download Study Profile CSV Template" />
          <DropZone endpoint={api.uploadStudyProfile} method="POST" />
          <StudiesDownloadForm />
        </Grid>
      </Grid>

      <StudiesTable studies={studies} paging={true} />
    </div>
  )
}
