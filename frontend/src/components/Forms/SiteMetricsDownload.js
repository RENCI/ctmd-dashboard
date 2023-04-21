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

const columns = [
  { label: 'Proposal ID',                                                 key: 'ProposalID' },
  { label: 'Protocol Name',                                               key: 'ProposalTitle' },
  { label: 'Protocol (Short Description)',                                key: 'ProposalDescription' },
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
  { label: 'Major protocol deviations per randomized patients',           key: 'majorProtocolDeviationsPerRandomizedPt' },
  { label: 'Number of Queries',                                           key: 'queriesCount' },
  { label: 'Queries per patient',                                         key: 'queriesPerConsentedPatient' },
];

export const SiteMetricsDownload = () => {
  const [{ proposals }] = useStore()
  const [sites, setSites] = useState([])

  useEffect(() => {
    const getSites = async () => {
      try {
        const sites = [];
        for (const proposal of proposals) {
          console.log(proposal);
          const response = await axios.get(api.studySitesByProposalId(proposal.proposalID))
  
          const proposalSites = response.data;
  
          proposalSites.forEach(site => {
            convertEnrollmentData(site)
            computeMetrics(site)
            site.ProposalTitle = proposal.shortTitle
            site.ProposalDescription = proposal.shortDescription
          });
  
          sites.push(...proposalSites);
        }
  
        setSites(sites)
      }
      catch (error) {
        console.log(error)
      }
    };

    getSites();
  }, [proposals])

  console.log(sites);

  return (
    <Tooltip title='Download site metrics' aria-label='Download site metrics'>
      <Button
        component={ CSVLink }
        headers={ columns }
        data={ sites }
        filename='site-metrics'
        variant='outlined'
        startIcon={ <DownloadIcon /> }
      >Site Metrics</Button>
    </Tooltip>
  )
}
