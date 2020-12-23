import React, { Fragment, useContext, useEffect, useState } from 'react'
import { StoreContext } from '../../contexts/StoreContext'
import api from '../../Api'
import { Title, Subsubheading, Paragraph } from '../../components/Typography'
import { StudiesTable } from '../../components/Tables'
import { Grid, List, ListItem, ListItemText } from '@material-ui/core'
import { DropZone } from '../../components/Forms/DropZone'
import { DownloadButton } from '../../components/Forms'
import { DataUploadHelper } from '../../components/Helper'

export const StudiesListPage = props => {
  const [store, ] = useContext(StoreContext)
  const [studies, setStudies] = useState([])

  useEffect(() => {
    if (store.proposals) {
      const proposalsWithProfiles = store.proposals.filter(proposal => proposal.profile && true)
      setStudies(proposalsWithProfiles)
    }
  }, [store.proposals])

  return (
    <div>

      <Grid container>
        <Grid item xs={ 11 } md={ 6 }>
          <Title>Studies</Title>
        </Grid>
        <Grid item xs={ 11 } md={ 5 }>
          <DropZone endpoint={ api.uploadStudyProfile } method="POST" />
        </Grid>
        <Grid item xs={ 1 } style={{ textAlign: 'right' }}>
          <DownloadButton path={ api.download('study-profile')} tooltip="Download Study Profile CSV Template" />
          <DataUploadHelper />
        </Grid>
      </Grid>


      <StudiesTable studies={ studies } paging={ true } />
      
    </div>
  )
}
