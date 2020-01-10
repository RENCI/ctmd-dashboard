import React, { Fragment, useContext, useState } from 'react'
import { Title } from '../components/Typography'
import {
    Grid, FormControl, FormGroup, FormLabel, FormControlLabel, Checkbox, FormHelperText, Switch,
    Select, OutlinedInput, MenuItem, IconButton
} from '@material-ui/core'
import { DangerZone, TaskManager } from '../components/Forms'
import { SettingsContext } from '../contexts/SettingsContext'
import { CollapsibleCard } from '../components/CollapsibleCard'
import { Refresh as RefreshIcon } from '@material-ui/icons'

export const SettingsPage = props => {
    const [settings, setSettings] = useContext(SettingsContext)
    const [taskManagerKey, setTaskManagerKey] = useState(0)

    const handleChangeVisibleColumns = event => {
        const visibleColumns = { ...settings.tables.visibleColumns, [event.target.value]: event.target.checked }
        setSettings({ ...settings, tables: { ...settings.tables, visibleColumns } })
    }

    const handleChangePageSize = event => {
        const tableSettings = { ...settings.tables, pageSize: event.target.value }
        setSettings({ ...settings, tables: tableSettings })
    }

    const handleToggleHideEmptyGroups = event => {
        const chartSettings = { ...settings.charts, [event.target.value]: event.target.checked }
        setSettings({ ...settings, charts: chartSettings })
    }

    const handleRefreshTaskManager = () => setTaskManagerKey(taskManagerKey === 0 ? 1 : 0)

    return (
        <Fragment>
            <Title>Settings</Title>
            
            <Grid container spacing={ 8 }>
                <Grid item xs={ 12 }>
                    <CollapsibleCard
                        title="Chart Settings"
                        subheader="Settings affecting how charts are displayed"
                    >
                        <FormControl component="fieldset">
                            <FormLabel component="legend">Hide Empty Groups</FormLabel>
                            <FormHelperText>
                                When toggled on, charts rendered throughout the proposal browsing pages will not display groups of proposals that are empty by default.
                                This option can be changes on an individual basis, but will revert to the default setting when a chart re-renders.
                            </FormHelperText>
                            <FormGroup>
                                <Switch checked={ settings.charts.hideEmptyGroups } onChange={ handleToggleHideEmptyGroups } value="hideEmptyGroups" />
                            </FormGroup>
                        </FormControl>
                    </CollapsibleCard>
                </Grid>

                <Grid item xs={ 12 }>
                    <CollapsibleCard
                        title="Table Settings"
                        subheader="Settings affecting how proposal tables are displayed"
                    >
                        <FormControl component="fieldset">
                            <FormLabel component="legend">Default Visible Columns</FormLabel>
                            <FormHelperText>
                                Selected columns will be visible by default when viewing proposal tables.
                                The visible columns will still be able to be altered individually when viewing a table.
                            </FormHelperText>
                            <FormGroup>
                                <FormControlLabel control={ <Checkbox checked={ settings.tables.visibleColumns.proposalID } onChange={ handleChangeVisibleColumns } value="proposalID" />} label="Proposal ID" />
                                <FormControlLabel control={ <Checkbox checked={ settings.tables.visibleColumns.shortTitle } onChange={ handleChangeVisibleColumns } value="shortTitle" />} label="Proposal Name" />
                                <FormControlLabel control={ <Checkbox checked={ settings.tables.visibleColumns.piName } onChange={ handleChangeVisibleColumns } value="piName" /> } label="PI Name" />
                                <FormControlLabel control={ <Checkbox checked={ settings.tables.visibleColumns.proposalStatus } onChange={ handleChangeVisibleColumns } value="proposalStatus" /> } label="Proposal Status" />
                                <FormControlLabel control={ <Checkbox checked={ settings.tables.visibleColumns.therapeuticArea } onChange={ handleChangeVisibleColumns } value="therapeuticArea" /> } label="Therapeutic Area" />
                                <FormControlLabel control={ <Checkbox checked={ settings.tables.visibleColumns.submitterInstitution } onChange={ handleChangeVisibleColumns } value="submitterInstitution" /> } label="Submitting Institution" />
                                <FormControlLabel control={ <Checkbox checked={ settings.tables.visibleColumns.assignToInstitution } onChange={ handleChangeVisibleColumns } value="assignToInstitution" /> } label="Assign TIC/RIC" />
                                <FormControlLabel control={ <Checkbox checked={ settings.tables.visibleColumns.dateSubmitted } onChange={ handleChangeVisibleColumns } value="dateSubmitted" /> } label="Submission Date" />
                                <FormControlLabel control={ <Checkbox checked={ settings.tables.visibleColumns.meetingDate } onChange={ handleChangeVisibleColumns } value="meetingDate" /> } label="PAT Review Date" />
                                <FormControlLabel control={ <Checkbox checked={ settings.tables.visibleColumns.plannedGrantSubmissionDate } onChange={ handleChangeVisibleColumns } value="plannedGrantSubmissionDate" /> } label="Planned Grant Submission Date" />
                                <FormControlLabel control={ <Checkbox checked={ settings.tables.visibleColumns.actualGrantSubmissionDate } onChange={ handleChangeVisibleColumns } value="actualGrantSubmissionDate" /> } label="Actual Grant Submission Date" />
                                <FormControlLabel control={ <Checkbox checked={ settings.tables.visibleColumns.fundingStatus } onChange={ handleChangeVisibleColumns } value="fundingStatus" /> } label="Funding Status" />
                                <FormControlLabel control={ <Checkbox checked={ settings.tables.visibleColumns.estimatedFundingStartDate } onChange={ handleChangeVisibleColumns } value="estimatedFundingStartDate" /> } label="Estimated Funding Start Date" />
                                <FormControlLabel control={ <Checkbox checked={ settings.tables.visibleColumns.actualFundingStartDate } onChange={ handleChangeVisibleColumns } value="actualFundingStartDate" /> } label="Actual Funding Start Date" />
                                <FormControlLabel control={ <Checkbox checked={ settings.tables.visibleColumns.totalBudget } onChange={ handleChangeVisibleColumns } value="totalBudget" /> } label="Funding Amount" />
                                <FormControlLabel control={ <Checkbox checked={ settings.tables.visibleColumns.fundingPeriod } onChange={ handleChangeVisibleColumns } value="fundingPeriod" /> } label="Funding Period" />
                                <FormControlLabel control={ <Checkbox checked={ settings.tables.visibleColumns.approvedForComprehensiveConsultation } onChange={ handleChangeVisibleColumns } value="approvedForComprehensiveConsultation" /> } label="Approved for Comprehensive Consultation" />
                                <FormControlLabel control={ <Checkbox checked={ settings.tables.visibleColumns.resources } onChange={ handleChangeVisibleColumns } value="resources" /> } label="Resources Requests & Approvals" />
                                <FormControlLabel control={ <Checkbox checked={ settings.tables.visibleColumns.studyPopulation } onChange={ handleChangeVisibleColumns } value="studyPopulation" /> } label="Study Population" />
                                <FormControlLabel control={ <Checkbox checked={ settings.tables.visibleColumns.phase } onChange={ handleChangeVisibleColumns } value="phase" /> } label="Phase" />
                            </FormGroup>
                        </FormControl>

                        <br />
                        <br />

                        <FormControl component="fieldset">
                            <FormLabel component="legend">Default Page Size</FormLabel>
                            <FormHelperText>
                                Sets the default number of proposals to display per page on proposals tables.
                            </FormHelperText>
                            <br/>
                            <Select
                                value={ settings.tables.pageSize }
                                onChange={ handleChangePageSize }
                                input={<OutlinedInput name="page-size" id="page-size" />}
                            >
                                <MenuItem value={15}>15 Proposals</MenuItem>
                                <MenuItem value={25}>25 Proposals</MenuItem>
                                <MenuItem value={50}>50 Proposals</MenuItem>
                                <MenuItem value={100}>100 Proposals</MenuItem>
                                <MenuItem value={200}>200 Proposals</MenuItem>
                            </Select>
                        </FormControl>
                    </CollapsibleCard>
                </Grid>

                <Grid item xs={ 12 }>
                    <CollapsibleCard
                        title="Danger Zone"
                        subheader="Backup, restore, and synchronize data"
                    >
                        <DangerZone />
                    </CollapsibleCard>
                </Grid>

                <Grid item xs={ 12 }>
                    <CollapsibleCard
                        title="Task Manager"
                        subheader="View tasks and their statuses"
                        actions={
                            <IconButton onClick={ handleRefreshTaskManager }><RefreshIcon /></IconButton>
                        }
                    >
                        <TaskManager key={ taskManagerKey }/>
                    </CollapsibleCard>
                </Grid>
            </Grid>

        </Fragment>
    )
}
