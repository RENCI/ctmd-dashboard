import React, { Fragment, useContext } from 'react'
import { Heading } from '../components/Typography/Typography'
import {
    Grid, Card, CardHeader, CardContent,
    FormControl, FormGroup, FormLabel, FormControlLabel, Checkbox, FormHelperText, Switch
} from '@material-ui/core'
import { SettingsContext } from '../contexts/SettingsContext'

const SettingsPage = props => {
    const [settings, setSettings] = useContext(SettingsContext)

    const handleChangeVisibleColumns = event => {
        const visibleColumns = { ...settings.visibleColumns, [event.target.value]: event.target.checked }
        setSettings({ ...settings, visibleColumns })
    }

    const handleToggleHideEmptyGroups = event => {
        const chartSettings = { ...settings.charts, [event.target.value]: event.target.checked }
        setSettings({ ...settings, charts: chartSettings })
    }

    return (
        <Fragment>
            <Heading>Settings</Heading>
            
            <Grid container spacing={ 16 }>
                <Grid item xs={ 12 }>
                    <Card>
                        <CardHeader
                            title="Chart Settings"
                            subheader="Settings affecting how charts are displayed"
                        />
                        <CardContent>
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
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Grid item xs={ 12 }>
                <Card>
                    <CardHeader
                        title="Table Settings"
                        subheader="Settings affecting how proposal tables are displayed"
                    />
                    <CardContent>
                        <FormControl component="fieldset">
                            <FormLabel component="legend">Default Visible Columns</FormLabel>
                            <FormHelperText>
                                Selected columns will be visible by default when viewing proposal tables.
                                The visible columns will still be able to be altered individually when viewing a table.
                            </FormHelperText>
                            <FormGroup>
                                <FormControlLabel control={ <Checkbox checked={ settings.visibleColumns.shortTitle } onChange={ handleChangeVisibleColumns } value="shortTitle" />} label="Proposal Name" />
                                <FormControlLabel control={ <Checkbox checked={ settings.visibleColumns.piName } onChange={ handleChangeVisibleColumns } value="piName" /> } label="PI Name" />
                                <FormControlLabel control={ <Checkbox checked={ settings.visibleColumns.proposalStatus } onChange={ handleChangeVisibleColumns } value="proposalStatus" /> } label="Proposal Status" />
                                <FormControlLabel control={ <Checkbox checked={ settings.visibleColumns.therapeuticArea } onChange={ handleChangeVisibleColumns } value="therapeuticArea" /> } label="Therapeutic Area" />
                                <FormControlLabel control={ <Checkbox checked={ settings.visibleColumns.submitterInstitution } onChange={ handleChangeVisibleColumns } value="submitterInstitution" /> } label="Submitting Institution" />
                                <FormControlLabel control={ <Checkbox checked={ settings.visibleColumns.assignToInstitution } onChange={ handleChangeVisibleColumns } value="assignToInstitution" /> } label="Assign TIC/RIC" />
                                <FormControlLabel control={ <Checkbox checked={ settings.visibleColumns.dateSubmitted } onChange={ handleChangeVisibleColumns } value="dateSubmitted" /> } label="Submission Date" />
                                <FormControlLabel control={ <Checkbox checked={ settings.visibleColumns.meetingDate } onChange={ handleChangeVisibleColumns } value="meetingDate" /> } label="PAT Review Date" />
                                <FormControlLabel control={ <Checkbox checked={ settings.visibleColumns.plannedGrantSubmissionDate } onChange={ handleChangeVisibleColumns } value="plannedGrantSubmissionDate" /> } label="Planned Grant Submission Date" />
                                <FormControlLabel control={ <Checkbox checked={ settings.visibleColumns.fundingStart } onChange={ handleChangeVisibleColumns } value="fundingStart" /> } label="Grant Approval Date" />
                            </FormGroup>
                        </FormControl>
                    </CardContent>
                </Card>
            </Grid>

        </Fragment>
    )
}

export default SettingsPage