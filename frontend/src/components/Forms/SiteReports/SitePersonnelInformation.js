import React, { Fragment, useState } from 'react'
import { CardHeader, InputLabel, TextField, Divider } from '@material-ui/core'
import Subheading from '../../Typography/Subheading'

const SitePersonnelInformationForm = props => {
    const [values, setValues] = useState({})

    const handleChange = name => event => setValues({ ...values, [name]: event.target.value })
    
    const fields = [
        { label: 'Site Name', id: 'site-name', },
        { label: 'Site Number', id: 'site-number', },
        { label: 'Principal Investigator', id: 'principal-investigator', },
        { label: 'Study Coordinator', id: 'study-coordinator', },
        { label: 'CTSA Name', id: 'ctsa-name', },
        { label: 'CTSA Point of Contact', id: 'ctsa-poc', },
    ]

    return (
        <Fragment>
            {
                fields.map(field => {
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

        </Fragment>
    )
}

export default SitePersonnelInformationForm