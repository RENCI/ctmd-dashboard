export const invalidDisplay = 'N/A'

const ratioAsWholeNumberString = (a, b) => {
  return b === 0 ? invalidDisplay : Math.round(a / b)
}

export const displayRatio = (a, b, precision = 2) => {
  a = parseInt(a)
  b = parseInt(b)
  if ( !a || !b ) {
    return invalidDisplay
  }
  if (a === 0) {
    if (b === 0) return invalidDisplay
    return `0% (${ a }/${ b })`
  }
  return b !== 0
    ? `${ (100 * a/b).toFixed(precision) }% (${ a }/${ b })`
    : `N/A`
}

export const dayCount = (startDate, endDate) => {
  if (startDate && endDate) {
    const num = Math.round((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))
    return `${ num } day${ num === 1 ? '' : 's' }`
  } else {
      return invalidDisplay
  }
}

export const convertEnrollmentData = site => {
  // Convert enrollment data to numbers
  site.patientsConsentedCount = +site.patientsConsentedCount
  site.patientsEnrolledCount = +site.patientsEnrolledCount
  site.patientsWithdrawnCount = +site.patientsWithdrawnCount
  site.patientsExpectedCount = +site.patientsExpectedCount
  site.queriesCount = +site.queriesCount
  site.protocolDeviationsCount = +site.protocolDeviationsCount
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

