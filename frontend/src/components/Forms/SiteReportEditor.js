import React, { Fragment, useState, useContext, useEffect } from 'react'
import axios from 'axios'
import { ApiContext } from '../../contexts/ApiContext'
import { makeStyles } from '@material-ui/styles'
import { Tabs, Tab, InputLabel, TextField, Button } from '@material-ui/core'
import { FlashMessageContext } from '../../contexts/FlashMessageContext'

const useStyles = makeStyles(theme => ({
    root: {
        ...theme.mixins.debug,
        width: '100%',
    },
    textField: {
        marginBottom: 2 * theme.spacing.unit,
    },
    fieldsContainer: {
        padding: `${ 4 * theme.spacing.unit }px ${ 2 * theme.spacing.unit }px 0 ${ 2 * theme.spacing.unit }px`,
    },
}))

const SiteReportFormContext = React.createContext({})

const SiteReportEditor = props => {
    const { readOnly } = props
    const [values, setValues] = useState({ })
    const [tabNumber, setTabNumber] = useState(0)
    const classes = useStyles()
    const api = useContext(ApiContext)
    const addFlashMessage = useContext(FlashMessageContext)

    useEffect(() => {
        setValues({ ...values, proposalID: props.proposalID });
    }, [props.proposalID])

    const handleChange = (event, value) => { setTabNumber(value) }
    const handleEditField = name => event => {
        setValues({ ...values, [name]: event.target.value });
    };
    const handleSave = () => {
        axios.post(api.saveSiteReport, values)
            .then(response => {
                addFlashMessage({ type: 'success', text: 'Site Report Saved!'})
            })
            .catch(error => console.log('Error', error))
    }

    const kebabToCamelCase = text => {
        return (
            text.split('-').map(
                (word, i) => i > 0
                ? word.charAt(0).toUpperCase() + word.toLowerCase().slice(1)
                : word
            ).join('')
        )
    }
    
    const subforms = [
        {
            title: 'Site Information',
            fields: [
                { label: 'Study Name', id: 'study-name', },
                { label: 'Site Number', id: 'site-number', },
                { label: 'Site Name', id: 'site-name', },
                { label: 'Principal Investigator', id: 'principal-investigator', },
                { label: 'Study Coordinator', id: 'study-coordinator', },
                { label: 'CTSA Name', id: 'ctsa-name', },
                { label: 'CTSA Point of Contact', id: 'ctsa-poc', },
            ],
        }, {
            title: 'Protocol Information',
            fields: [
                { label: 'Active Protocol Date', id: 'active-protocol-date', },
                { label: 'Protocol Version', id: 'protocol-version', },
            ],
        }, {
            title: 'Enrollment',
            fields: [
                { label: 'Projected Enrollment Per Month', id: 'projected-enrollment-per-month', },
                { label: 'Days to First Consent', id: 'days-to-first-consent', },
                { label: 'Days with no Consent', id: 'days-with-no-consent', },
                { label: 'Days to First Pt Enrolled', id: 'days-to-fist-pt-enrolled', },
                { label: 'Days with no Enrollment', id: 'days-with-no-enrollment', },
            ],
        }, {
            title: 'Miscellaneous',
            fields: [
                { label: 'IRB Original Approval', id: 'irb-original-approval', },
                { label: 'CTA FE', id: 'cta-fe', },
                { label: 'Date of First Consent', id: 'date-to-first-consent', },
                { label: 'Date of First Pt Enrolled', id: 'date-of-first-pt-enrolled', },
                { label: 'Most Recent Consent', id: 'most-recent-consent', },
                { label: 'Most Recent Pt Enrolled', id: 'most-recent-pt-enrolled', },
                { label: 'Number of Pts Signed Consent', id: 'number-pts-signed-consent', },
                { label: 'Number of Pts Enrolled', id: 'number-pts-enrolled', },
                { label: 'Number of Pts Active', id: 'number-pts-active', },
                { label: 'Number of Pts Complete', id: 'number-pts-complete', },
                { label: 'Number of Pts Withdrawn', id: 'number-pts-withdrawn', },
                { label: 'Number of CRFs Completed', id: 'number-crfs-completed', },
                { label: 'Percent CRFs Reviews/Final', id: 'percent-crfs-reviews-final', },
                { label: 'Percent CRFs Incomplete', id: 'percent-crfs-incomplete', },
                { label: 'Number of Unresolved Queries', id: 'number-unresolves-queries', },
                { label: 'Number of SAEs', id: 'site-information-number-seas', },
                { label: 'Number of Significant Protocol Deviations', id: 'number-significant-protocol-deviations', },
            ],
        }, {
            title: 'Notes',
            fields: [
                { label: 'Notes to Site', id: 'site-notes', multiline: true, },
            ],
        },
    ]
    
    return (
        <SiteReportFormContext.Provider value={ [values, setValues] }>
            <Tabs value={ tabNumber } indicatorColor="primary" textColor="primary" variant="scrollable" scrollButtons="on" onChange={ handleChange }>
                { subforms.map(subform => <Tab key={ subform.title } disableRipple label={ subform.title } />) }
            </Tabs>
            <div className={ classes.fieldsContainer }>
                {
                    subforms[tabNumber].fields.map(field => (
                        <Fragment key={ field.id }>
                            <InputLabel disabled={ readOnly }>{ field.label }</InputLabel>
                            <TextField variant={ "outlined" } fullWidth className={ classes.textField }
                                multiline={ field.multiline || false }
                                rows={ field.multiline ? 10 : null }
                                id={ field.id }
                                value={ values[kebabToCamelCase(field.id)] }
                                onChange={ handleEditField(kebabToCamelCase(field.id)) }
                                InputProps={{ readOnly: readOnly }}
                                disabled={ readOnly }
                            />
                            <br/>
                        </Fragment>
                    ))
                }
                { readOnly === false ? <Button variant="contained" color="secondary" onClick={ handleSave }>Save</Button> : null }
            </div>
        </SiteReportFormContext.Provider>
    )
}

export default SiteReportEditor