import React, { useState } from 'react'
import api from '../Api'
import { Title } from '../components/Typography'
import { Grid } from '@material-ui/core'

export const CtsasPage = (props) => {
    return (
        <div>
            <Title>CTSAs</Title>

            <Grid container>
            
              <Grid item xs={ 12 }>
                  Lorem ipsum dolor sit.
              </Grid>
            
            </Grid>
        </div>
    )
}
