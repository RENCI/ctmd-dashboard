import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {
  Button, Checkbox, Divider, Fade, FormControlLabel, FormGroup, Paper, Popper, Tooltip, Typography,
} from '@material-ui/core'
import api from '../../Api'
import { DownloadIcon } from '../Icons/Download'
import { Warning as WarningIcon } from '@material-ui/icons';
import { useStore } from '../../contexts'
import { CSVLink } from 'react-csv'
import { convertEnrollmentData, computeMetrics } from '../../utils/sites'

//

const columns = [
  { label: 'Proposal ID',                                                 key: 'ProposalID' },
  { label: 'Proposal Name',                                               key: 'ProposalTitle' },
  { label: 'Protocol (Short Description)',                                key: 'ProposalDescription' },
  { label: 'CTSA Name',                                                   key: 'ctsaName' },
  { label: 'Site ID',                                                     key: 'siteId' },
  { label: 'CTSA ID',                                                     key: 'ctsaId' },
  { label: 'Site name',                                                   key: 'siteName' },
  { label: 'Site Number',                                                 key: 'siteNumber' },
  { label: 'PI',                                                          key: 'principalInvestigator' },
  { label: 'Date Protocol Sent',                                          key: 'dateRegPacketSent' },
  { label: 'Contract Sent',                                               key: 'dateContractSent' },
  { label: 'IRB Submission',                                              key: 'dateIrbSubmission' },
  { label: 'IRB Approval',                                                key: 'dateIrbApproval' },
  { label: 'ContractExecution',                                           key: 'dateContractExecution' },
  { label: 'Site Activation',                                             key: 'dateSiteActivated' },
  { label: 'FPFV',                                                        key: 'fpfv' },
  { label: 'LPFV',                                                        key: 'lpfv' },
  { label: 'Enrollment',                                                  key: 'enrollment'},
  { label: 'Patients Consented',                                          key: 'patientsConsentedCount'},
  { label: 'Patients Enrolled',                                           key: 'patientsEnrolledCount'},
  { label: 'Patients Withdrawn',                                          key: 'patientsWithdrawnCount'},
  { label: 'Patients Expected',                                           key: 'patientsExpectedCount'},
  { label: 'Protocol Deviations',                                         key: 'protocolDeviationsCount'},
  { label: 'Lost to Follow Up',                                           key: 'lostToFollowUp'},
  { label: 'Protocol to FPFV',                                            key: 'protocolToFpfv' },
  { label: 'Contract Execution Time',                                     key: 'contractExecutionTime' },
  { label: 'sIRB Approval Time',                                          key: 'sirbApprovalTime' },
  { label: 'Site Open to FPFV',                                           key: 'siteOpenToFpfv' },
  { label: 'Site Open to LPFV',                                           key: 'siteOpenToLpfv' },
  { label: 'Percent of consented patients randomized',                    key: 'percentConsentedPtsRandomized' },
  { label: 'Actual to expected randomized patient ratio',                 key: 'actualToExpectedRandomizedPtRatio' },
  { label: 'Ratio of randomized patients that dropped out of the study',  key: 'ratioRandomizedPtsDropout' },
  { label: 'Major protocol deviations per randomized patient',            key: 'majorProtocolDeviationsPerRandomizedPt' },
  { label: 'Number of Queries',                                           key: 'queriesCount' },
  { label: 'Queries per patient',                                         key: 'queriesPerConsentedPatient' },
];

export const SiteMetricsDownload = () => {
  const [{ proposals }] = useStore()
  const [sites, setSites] = useState([])
  const [popperAnchor, setPopperAnchor] = useState(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const getSites = async () => {
      try {
        const sites = []
        for (const proposal of proposals) {
          const response = await axios.get(api.studySitesByProposalId(proposal.proposalID))
  
          const proposalSites = response.data
  
          proposalSites.forEach(site => {
            convertEnrollmentData(site)
            computeMetrics(site)

            site.ProposalTitle = proposal.shortTitle
            site.ProposalDescription = proposal.shortDescription
          });
  
          sites.push(...proposalSites)
        }

        setSites(sites)
      }
      catch (error) {
        console.log(error)
      }
    };

    getSites();
  }, [proposals])

  const onClickOpen = event => {
    setPopperAnchor(event.currentTarget)
    setOpen(prevOpen => !prevOpen)
  }

  return (
    <>
      <Tooltip title='Download site metrics' aria-label='Download site metrics'>
        <Button
          variant='outlined'
          startIcon={ <DownloadIcon /> }
          onClick={ onClickOpen }
        >Site Metrics</Button>
      </Tooltip>
      <Popper
        open={ open }
        anchorEl={ popperAnchor }
        placement='bottom'
        transition
        style={{ zIndex: 99 }}
      >
        {
          ({ TransitionProps }) => (
            <Fade { ...TransitionProps } timeout={ 350 }>
              <Paper style={{ width: '200px',
                display: 'flex',
                flexDirection: 'column', }}>
                <Typography
                  variant='h6'
                  style={{ padding: '0.5rem 1rem' }}
                >
                  Site Metrics Download
                </Typography>
                
                <Divider />
                
                <div style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                  <div><WarningIcon /></div>
                  <div>After you click the DOWNLOAD button wait for the file to finish downloading before opening, or data may be missing.</div>
                </div>                
                
                <Divider />
                
                <Button
                  component={ CSVLink }
                  headers={ columns }
                  data={ sites }
                  filename='site-metrics'
                >Download</Button>
              </Paper>
            </Fade>
          )
        }
      </Popper>
    </>
  )
}
