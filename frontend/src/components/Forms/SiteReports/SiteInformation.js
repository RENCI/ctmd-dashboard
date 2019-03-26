import React, { Fragment, useState } from 'react'
import { CardHeader, InputLabel, TextField, Divider } from '@material-ui/core'
import Subheading from '../../Typography/Subheading'

const SiteInformationForm = props => {
    const [values, setValues] = useState({})

    const handleChange = name => event => setValues({ ...values, [name]: event.target.value })
    
    const fields = [
        {
            name: 'Study',
            fields: [
                { label: 'Study Name', id: 'study-name', },
            ]
        },
        {
            name: 'Protocol',
            fields: [
                { label: 'Active Protocol Date', id: 'active-protocol-date', },
                { label: 'Protocol Version', id: 'protocol-version', },
            ],
        },
        {
            name: 'Enrollment',
            fields: [
                { label: 'Projected Enrollment Per Month', id: 'projected-enrollment-per-month', },

                { label: 'Days to First Consent', id: 'days-to-first-consent', },
                { label: 'Days with no Consent', id: 'days-with-no-consent', },
                { label: 'Days to First Pt Enrolled', id: 'days-to-fist-pt-enrolled', },
                { label: 'Days with no Enrollment', id: 'days-with-no-enrollment', },
            ],
        },
        {
            name: 'Section',
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
        },
        {
            name: 'Notes',
            fields: [
                { label: 'Notes to Site', id: 'notes', },
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

export default SiteInformationForm