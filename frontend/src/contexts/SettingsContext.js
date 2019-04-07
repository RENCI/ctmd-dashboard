import React, { useState } from 'react'

export const SettingsContext = React.createContext({})

export const defaultSettings = {
    visibleColumns: {
        proposalID: true,
        shortTitle: true,
        piName: true,
        proposalStatus: true,
        therapeuticArea: true,
        submitterInstitution: true,
        assignToInstitution: true,
        dateSubmitted: true,
        meetingDate: false,
        plannedGrantSubmissionDate: false,
        actualGrantSubmissionDate: false,
        fundingStart: false,
    },
    charts: {
        hideEmptyGroups: true,
    }
}

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(defaultSettings)

    return <SettingsContext.Provider value={ [settings, setSettings] }>
        { children }
    </SettingsContext.Provider>
}

