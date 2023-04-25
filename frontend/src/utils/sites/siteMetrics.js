export const invalidDisplay = 'N/A'

const ratio = (a, b, precision = null) => {
  const v = b === 0 ? null : a / b
  return v && precision !== null ? v.toFixed(precision) : v
}

const ratioAsWholeNumberString = (a, b) => {
  return b === 0 ? invalidDisplay : Math.round(a / b)
}

const percent = (a, b, precision = null) => {
  a = parseInt(a)
  b = parseInt(b)
  
  const v = !a || !b ? null : b === 0 ? null : a / b * 100

  return v && precision !== null ? v.toFixed(precision) : v
}

export const percentDisplay = (a, b, precision = 2) => {
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

const dayCount = (startDate, endDate) => {
  return Math.round((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))
}

export const dayCountDisplay = (startDate, endDate) => {
  if (startDate && endDate) {
    const num = dayCount(startDate, endDate)
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
  site.protocolToFpfvDisplay = dayCountDisplay(site.dateRegPacketSent, site.fpfv)
  site.contractExecutionTime = dayCount(site.dateContractSent, site.dateContractExecution)
  site.contractExecutionTimeDisplay = dayCountDisplay(site.dateContractSent, site.dateContractExecution)
  site.sirbApprovalTime = dayCount(site.dateIrbSubmission, site.dateIrbApproval)
  site.sirbApprovalTimeDisplay = dayCountDisplay(site.dateIrbSubmission, site.dateIrbApproval)
  site.siteOpenToFpfv = dayCount(site.dateSiteActivated, site.fpfv)
  site.siteOpenToFpfvDisplay = dayCountDisplay(site.dateSiteActivated, site.fpfv)
  site.protocolToLpfv = dayCount(site.dateSiteActivated, site.lpfv)
  site.protocolToLpfvDisplay = dayCountDisplay(site.dateSiteActivated, site.lpfv)
  site.percentConsentedPtsRandomized = percent(site.patientsEnrolledCount, site.patientsConsentedCount, 0)
  site.percentConsentedPtsRandomizedDisplay = percentDisplay(site.patientsEnrolledCount, site.patientsConsentedCount)
  site.actualToExpectedRandomizedPtRatio = percent(site.patientsEnrolledCount, site.patientsExpectedCount, 0)
  site.actualToExpectedRandomizedPtRatioDisplay = percentDisplay(site.patientsEnrolledCount, site.patientsExpectedCount)
  site.ratioRandomizedPtsDropout = percent(site.patientsWithdrawnCount, site.patientsEnrolledCount, 0)
  site.ratioRandomizedPtsDropoutDisplay = percentDisplay(site.patientsWithdrawnCount, site.patientsEnrolledCount)
  site.majorProtocolDeviationsPerRandomizedPt = percent( site.protocolDeviationsCount, site.patientsEnrolledCount, 0)
  site.majorProtocolDeviationsPerRandomizedPtDisplay = percentDisplay(site.protocolDeviationsCount, site.patientsEnrolledCount)
  site.queriesPerConsentedPatient = ratio(site.queriesCount, site.patientsConsentedCount, 2)
  site.queriesPerConsentedPatientDisplay = ratioAsWholeNumberString(site.queriesCount, site.patientsConsentedCount)

  // Enrollment
  const enrolled = site.patientsEnrolledCount
  const expected = site.patientsExpectedCount
  const percentEnrolled = expected === 0 ? 0 : Math.round(enrolled / expected * 100)                
  site.enrollment = `${ enrolled } / ${ expected }: ${ percentEnrolled }%`
  site.percentEnrolled = percentEnrolled;
}

