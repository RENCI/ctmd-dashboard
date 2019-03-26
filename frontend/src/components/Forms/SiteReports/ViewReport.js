import React, { Fragment, useState } from 'react'
import { CardHeader, InputLabel, TextField, Divider } from '@material-ui/core'
import Subheading from '../../Typography/Subheading'

const ReportCardViewForm = props => {
    const [values, setValues] = useState({})

    const handleChange = name => event => setValues({ ...values, [name]: event.target.value })
    
    const fields = [
        {
            name: 'Site Details',
            fields: [
                { label: 'Site Number', id: 'site-number', },
                { label: 'Site Name', id: 'site-name', },
                { label: 'Principal Investigator', id: 'principal-investigator', },
                { label: 'Study Coordinator', id: 'study-coordinator', },
            ],
        },
        {
            name: 'CTSA',
            fields: [
                { label: 'CTSA Name', id: 'ctsa-name', },
                { label: 'CTSA Point of Contact', id: 'ctsa-poc', },
            ],
        },
        {
            name: 'Protocol',
            fields: [
                { label: 'Active Protocol Date', id: 'active-protocol-date', },
                { label: 'Protocol Version', id: 'protocol-version', },
            ],
        },
        {
            name: 'Section',
            fields: [
                { label: 'IRB Original Approval', id: 'irb-original-approval', },
                { label: 'CTA FE', id: 'cta-fe', },
                { label: 'Enrollment Status', id: 'enrollment-status', },
                { label: 'On Hold Days', id: 'on-hold-days', },
                { label: 'Projected Enrollment Per Month', id: 'projected-enrollment-per-month', },
                { label: 'Months Active', id: 'monrhs-active', },
                { label: 'CTSA Sent Date', id: 'ctsa-sent-date', },
                { label: 'Reg Pack Sent Date', id: 'reg-pack-sent-date', },
                { label: 'Site Selection Date', id: 'site-selection-date', },
                { label: 'Site Activation Date', id: 'site-activation-date', },
            ],
        },
        {
            name: 'Consent & Enrollment',
            fields: [
                { label: 'Date of First Consent', id: 'date-to-first-consent', },
                { label: 'Days to First Consent', id: 'days-to-first-consent', },
                { label: 'Most Recent Consent', id: 'most-recent-consent', },
                { label: 'Days with no Consent', id: 'days-with-no-consent', },
                { label: 'Date of First Pt Enrolled', id: 'date-of-first-pt-enrolled', },
                { label: 'Days to First Pt Enrolled', id: 'days-to-fist-pt-enrolled', },
                { label: 'Most Recent Pt Enrolled', id: 'most-recent-pt-enrolled', },
                { label: 'Days with no Enrollment', id: 'days-with-no-enrollment', },
            ],
        },
        {
            name: 'Pts',
            fields: [
                { label: 'Number Pts Signed Consent', id: 'number-', },
                { label: 'Number Pts Enrolled', id: 'number-pts-enrolled', },
                { label: 'Number Pts Active', id: 'number-pts-active', },
                { label: 'Number Pts Complete', id: 'number-pts-complete', },
                { label: 'Number Pts Withdrawn', id: 'number-pts-withdrawn', },
            ],
        },
        {
            name: 'Miscellaneous',
            fields: [
                { label: 'Number CRFs Completed', id: 'number-crfs-compelted', },
                { label: 'Percent CRFs Reviews/Final', id: 'percent-crfs-reviews-final', },
                { label: 'Percent CRFs Incomplete', id: 'percent-crfs-incomplete', },
                { label: 'Number Unresolved Queries', id: 'number-unresolves-queries', },
                { label: 'Site Information_Number SAEs', id: 'site-information-number-seas', },
                { label: 'Number Significant Protocol Deviations', id: 'number-significant-protocol-deviations', },
            ],
        },
    ]

    return (
        <Fragment>
            {
                fields.map(section => {
                    return (
                        <div key={ section.name }>
                            <Subheading>{ section.name }</Subheading>
                            {
                                section.fields.map(field => {
                                    return (
                                        <Fragment key={ field.id }>
                                            <InputLabel>{ field.label }</InputLabel>
                                            <TextField variant="outlined" fullWidth
                                                id={ field.id }
                                                value={ values[field.id] }
                                                onChange={ handleChange(field.id.split('-').map(text => text.charAt(0).toUpperCase() + text.slice(1)).join(' ')) }
                                            />
                                        </Fragment>
                                    )
                                })
                            }
                            <br/>
                            <br/>
                        </div>
                    )
                })
            }

        </Fragment>
    )
}

export default ReportCardViewForm