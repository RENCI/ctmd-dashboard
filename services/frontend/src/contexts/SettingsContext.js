import React, { useState } from 'react'

export const SettingsContext = React.createContext({})

export const defaultSettings = {
  tables: {
    visibleColumns: {
      proposalID: true,
      shortTitle: true,
      piName: false,
      proposalStatus: true,
      therapeuticArea: false,
      submitterInstitution: false,
      assignToInstitution: true,
      dateSubmitted: true,
      meetingDate: false,
      plannedGrantSubmissionDate: false,
      actualGrantSubmissionDate: false,
      fundingStatus: false,
      fundingSource: false,
      newFundingSource: false,
      estimatedFundingStartDate: false,
      actualFundingStartDate: false,
      totalBudget: false,
      fundingPeriod: false,
      approvedForComprehensiveConsultation: false,
      resources: false,
      studyPopulation: false,
      phase: false,
      fundingInstitute: false,
      fundingInstitute2: false,
      fundingInstitute3: false,
      fundingSourceConfirmation: false,
      numberCTSAprogHubSites: false,
      numberSites: false,
      actualProtocolFinalDate: false,
      actualGrantAwardDate: false,
      approvalReleaseDiff: false,
      covidStudy: false,
    },
    pageSize: 50,
  },
  charts: {
    hideEmptyGroups: true,
  },
}

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings)

  return <SettingsContext.Provider value={[settings, setSettings]}>{children}</SettingsContext.Provider>
}
