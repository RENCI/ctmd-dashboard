import React, { useState } from 'react'
import api from '../Api'
import { Title } from '../components/Typography'
import { Grid } from '@material-ui/core'

export const SitesPage = (props) => {
    return (
        <div>
            <Title>Sites</Title>

            <Grid container>
            
              <Grid item xs={ 12 }>
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ipsa aut suscipit id.
              </Grid>
            
            </Grid>
        </div>
    )
}
