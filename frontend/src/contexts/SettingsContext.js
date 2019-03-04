import React, { useState } from 'react'

export const SettingsContext = React.createContext({})

export const defaultSettings = {
    visibleColumns: {
        shortTitle: true,
        piName: true,
        proposalStatus: true,
        therapeuticArea: true,
        submitterInstitution: true,
        assignToInstitution: true,
        dateSubmitted: true,
        meetingDate: false,
        plannedGrantSubmissionDate: false,
        fundingStart: false,
    },
}

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(defaultSettings)

    return <SettingsContext.Provider value={ [settings, setSettings] }>
        { children }
    </SettingsContext.Provider>
}

