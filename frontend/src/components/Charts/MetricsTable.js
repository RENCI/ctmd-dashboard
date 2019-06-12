import React, { Fragment, useState, useContext, useEffect } from 'react'
import { makeStyles } from '@material-ui/styles'
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

const useStyles = makeStyles(theme => ({
    panel: {
        padding: `${ 2 * theme.spacing.unit }px ${ 4 * theme.spacing.unit }px`,
        backgroundColor: theme.palette.extended.gingerBeer,
    },
    header: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2 * theme.spacing.unit,
        borderBottom: `1px solid ${ theme.palette.grey[300] }`,
        alignItems: 'center',
    },
    title: {
        padding: `${ 2 * theme.spacing.unit }px 0`,
        color: theme.palette.secondary.main,
        fontWeight: 'bold',
        letterSpacing: '1px',
    },
    actions: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    chip: {
        margin: theme.spacing.unit,
        fontWeight: 'bold',
    },
    column1: {
        borderRight: `1px solid ${ theme.palette.grey[300] }`,
    },
    column2: {
        borderRight: `1px solid ${ theme.palette.grey[300] }`,
    },
    column3: {},
    servicesRow: {
        alignItems: 'flex-start'
    },
    service: {
        display: 'block',
    },
    timelineRow: {
        alignItems: 'flex-start',
        borderTop: `1px solid ${ theme.palette.grey[300] }`,
    },
    date: {
        display: 'block',
    },
    dayCount: {
        display: 'block',
    },
}))

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
                doubleHorizontalScroll: true,
            }}
        />
    ) : <div>...</div>
}

export default MetricsTable