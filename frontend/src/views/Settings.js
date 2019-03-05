import React, { Fragment, useState, useContext } from 'react'
import Heading from '../components/Typography/Heading'
import Subheading from '../components/Typography/Subheading'
import Paragraph from '../components/Typography/Paragraph'
import { Card, FormControl, FormGroup, FormLabel, FormControlLabel, Checkbox, FormHelperText } from '@material-ui/core'
import { SettingsContext } from '../contexts/SettingsContext'

const SettingsPage = props => {
    const [settings, setSettings] = useContext(SettingsContext)

    const handleChangeVisibleColumns = event => {
        const visibleColumns = { ...settings.visibleColumns, [event.target.value]: event.target.checked}
        setSettings({ visibleColumns })
    }

    return (
        <Fragment>
            <Heading>Settings</Heading>
            
            <Card>
                <Subheading>Table Settings</Subheading>

                <Paragraph>
                    Settings here will affect how proposal tables are displayed.
                </Paragraph>
                
                <FormControl component="fieldset">
                    <FormLabel component="legend">Default Visible Columns</FormLabel>
                    <FormHelperText>
                        Selected columns will be visible by default when viewing proposal tables.
                    </FormHelperText>
                    <FormGroup>
                        <FormControlLabel control={ <Checkbox checked={ settings.visibleColumns.shortTitle } onChange={ handleChangeVisibleColumns } value="shortTitle" />} label="Proposal Name" />
                        <FormControlLabel control={ <Checkbox checked={ settings.visibleColumns.piName } onChange={ handleChangeVisibleColumns } value="piName" /> } label="PI Name" />
                        <FormControlLabel control={ <Checkbox checked={ settings.visibleColumns.proposalStatus } onChange={ handleChangeVisibleColumns } value="proposalStatus" /> } label="Proposal Status" />
                        <FormControlLabel control={ <Checkbox checked={ settings.visibleColumns.therapeuticArea } onChange={ handleChangeVisibleColumns } value="therapeuticArea" /> } label="Therapeutic Area" />
                        <FormControlLabel control={ <Checkbox checked={ settings.visibleColumns.submitterInstitution } onChange={ handleChangeVisibleColumns } value="submitterInstitution" /> } label="Submitting Institution" />
                        <FormControlLabel control={ <Checkbox checked={ settings.visibleColumns.assignToInstitution } onChange={ handleChangeVisibleColumns } value="assignToInstitution" /> } label="Assign TIC/RIC" />
                        <FormControlLabel control={ <Checkbox checked={ settings.visibleColumns.dateSubmitted } onChange={ handleChangeVisibleColumns } value="dateSubmitted" /> } label="Submission Date" />
                        <FormControlLabel control={ <Checkbox checked={ settings.visibleColumns.meetingDate } onChange={ handleChangeVisibleColumns } value="meetingDate" /> } label="Approval Date" />
                        <FormControlLabel control={ <Checkbox checked={ settings.visibleColumns.plannedGrantSubmissionDate } onChange={ handleChangeVisibleColumns } value="plannedGrantSubmissionDate" /> } label="Grant Submission Date" />
                        <FormControlLabel control={ <Checkbox checked={ settings.visibleColumns.fundingStart } onChange={ handleChangeVisibleColumns } value="fundingStart" /> } label="Grant Approval Date" />
                    </FormGroup>
                </FormControl>
            </Card>
        </Fragment>
    )
}

export default SettingsPage