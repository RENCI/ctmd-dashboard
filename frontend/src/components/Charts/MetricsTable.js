import React, { Fragment, useState, useContext, useEffect } from 'react'
import MaterialTable from 'material-table'
import { Grid, Typography, List, Tooltip, ListItemIcon, ListItem, ListItemText, Chip } from '@material-ui/core'
import { Collapse } from '@material-ui/core'
import {
    AccountBox as PiIcon,
    CalendarToday as CalendarIcon,
    AccountBalance as InstitutionIcon,
    LocalOffer as TherapeuticAreaIcon,
    Assignment as TicIcon,
    Alarm as ProposalStatusIcon,
    AttachMoney as BudgetIcon,
    LocalLaundryService as ServicesIcon,
    CheckCircle as ApprovedIcon,
} from '@material-ui/icons'
import { SettingsContext } from '../../contexts/SettingsContext'

const MetricsTable = ({ title, studyData, paging }) => {
    const [settings] = useContext(SettingsContext)
    const [columns, setColumns] = useState()
    if (title) title += ` (${ studyData.length } Proposals)`
    
    useEffect(() => {
        if (studyData.length > 0) {
            const cols = Object.keys(studyData[0]).map(key => ({ title: key, field: key, }))
            console.log(cols)
            setColumns(cols)
        }
    }, [])

    return studyData && columns ? (
        <MaterialTable
            title={ title || '-' }
            components={{ }}
            columns={ columns || [] }
            data={ studyData }
            options={{
                paging: paging,
                columnsButton: true,
                exportButton: true,
                filtering: true,
                grouping: true,
                pageSize: 15,
                pageSizeOptions: [15, 25, 50, 100, 200],
                exportFileName: title,
            }}
        />
    ) : <div>...</div>
}

export default MetricsTable