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
  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'error'
  const [popperAnchor, setPopperAnchor] = useState(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let cancelled = false

    const getSites = async () => {
      setStatus('loading')
      try {
        // One bulk request for every study site, instead of one request per
        // proposal. The old per-proposal loop only called setSites() after all
        // ~575 sequential requests resolved, so any single failure — or a click
        // before the loop finished — produced a CSV with headers but no rows.
        const response = await axios.get(api.studySites(), { withCredentials: true })
        const allSites = response.data || []

        // Look up proposal title/description by proposal id. Sites key off
        // "ProposalID" (capitalized); store proposals use "proposalID".
        const proposalsById = new Map((proposals || []).map(p => [String(p.proposalID), p]))

        // Keep only sites that belong to a known proposal — matching the old
        // per-proposal behavior and excluding orphan StudySites rows that have
        // no ProposalID (they would export as blank-proposal rows).
        const relevantSites = allSites.filter(site => proposalsById.has(String(site.ProposalID)))

        relevantSites.forEach(site => {
          convertEnrollmentData(site)
          computeMetrics(site)

          const proposal = proposalsById.get(String(site.ProposalID))
          site.ProposalTitle = proposal.shortTitle
          site.ProposalDescription = proposal.shortDescription
        })

        if (!cancelled) {
          setSites(relevantSites)
          setStatus('ready')
        }
      }
      catch (error) {
        console.log(error)
        if (!cancelled) setStatus('error')
      }
    };

    getSites();

    return () => { cancelled = true }
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
                  <div>
                    { status === 'loading' && 'Preparing site metrics…' }
                    { status === 'error' && 'Could not load site metrics. Please try again.' }
                    { status === 'ready' && `${ sites.length } site rows ready to download.` }
                  </div>
                </div>

                <Divider />

                {
                  status === 'ready' ? (
                    <Button
                      component={ CSVLink }
                      headers={ columns }
                      data={ sites }
                      filename='site-metrics'
                    >Download</Button>
                  ) : (
                    <Button disabled>Download</Button>
                  )
                }
              </Paper>
            </Fade>
          )
        }
      </Popper>
    </>
  )
}
