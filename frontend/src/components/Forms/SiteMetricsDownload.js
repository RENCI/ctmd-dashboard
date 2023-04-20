import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {
  Button,Tooltip
} from '@material-ui/core'
import api from '../../Api'
import { DownloadIcon } from '../Icons/Download'
import { useStore } from '../../contexts'
import { CSVLink } from 'react-csv'
import { convertEnrollmentData, computeMetrics } from '../../utils/sites'

//

export const SiteMetricsDownload = () => {
  const [{ proposals }] = useStore()

  const handleClick = async () => {
    try {
      const sites = [];
      for (const proposal of proposals) {
        console.log(proposal);
        const response = await axios.get(api.studySitesByProposalId(proposal.proposalID))

        const sites = response.data;

        sites.forEach(site => {
          convertEnrollmentData(site)
          computeMetrics(site)
        });
      }
    }
    catch (error) {
      console.log(error)
    }
  };

  return (
    <Tooltip title="Download site metrics" aria-label="Download site metrics">
      <Button
        variant="outlined"
        startIcon={ <DownloadIcon /> }
        onClick={ handleClick }
      >Site Metrics</Button>
    </Tooltip>
  )
}
