export const convertEnrollmentData = site => {
  // Convert enrollment data to numbers
  site.patientsConsentedCount = +site.patientsConsentedCount
  site.patientsEnrolledCount = +site.patientsEnrolledCount
  site.patientsWithdrawnCount = +site.patientsWithdrawnCount
  site.patientsExpectedCount = +site.patientsExpectedCount
  site.queriesCount = +site.queriesCount
  site.protocolDeviationsCount = +site.protocolDeviationsCount
}

