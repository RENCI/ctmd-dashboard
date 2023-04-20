import { dayCount, displayRatio, invalidDisplay } from '.'

const ratioAsWholeNumberString = (a, b) => {
  return b === 0 ? invalidDisplay : Math.round(a / b)
}

export const computeMetrics = site => {
  site.protocolToFpfv = dayCount(site.dateRegPacketSent, site.fpfv)
  site.contractExecutionTime = dayCount(site.dateContractSent, site.dateContractExecution)
  site.sirbApprovalTime = dayCount(site.dateIrbSubmission, site.dateIrbApproval)
  site.siteOpenToFpfv = dayCount(site.dateSiteActivated, site.fpfv)
  site.protocolToLpfv = dayCount(site.dateSiteActivated, site.lpfv)
  site.percentConsentedPtsRandomized = displayRatio(site.patientsEnrolledCount, site.patientsConsentedCount)
  site.actualToExpectedRandomizedPtRatio = displayRatio(site.patientsEnrolledCount, site.patientsExpectedCount)
  site.ratioRandomizedPtsDropout = displayRatio(site.patientsWithdrawnCount, site.patientsEnrolledCount)
  site.majorProtocolDeviationsPerRandomizedPt = displayRatio( site.protocolDeviationsCount, site.patientsEnrolledCount)
  site.queriesPerConsentedPatient = ratioAsWholeNumberString(site.queriesCount, site.patientsConsentedCount )
}

