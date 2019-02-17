import React, { useState, useEffect, useContext } from 'react'
import { withStyles } from '@material-ui/core/styles'
import axios from 'axios'
import { ApiContext } from '../../contexts/ApiContext'
import classnames from 'classnames'
import { Card, CardContent, TextField, Button, Menu, MenuItem } from '@material-ui/core'
import OrgPieChart from '../../components/Charts/ProposalsPie'
import { CircularLoader } from '../../components/Progress/Progress'
import Heading from '../../components/Typography/Heading'
import Subheading from '../../components/Typography/Subheading'
import Paragraph from '../../components/Typography/Paragraph'
import ProposalsTable from '../../components/Charts/ProposalsTable'

const styles = (theme) => ({
    page: {
        // ...theme.mixins.debug
    },
    card: {
        marginBottom: 2 * theme.spacing.unit,
        backgroundColor: theme.palette.grey[100],
    },
    table: {
        padding: 2 * theme.spacing.unit,
        overflowY: 'scroll',
    },
})

const Resubmissions = (props) => {
    const { classes, theme } = props
    const [resubmissions, setResubmissions] = useState(null)
    const [resubmissionCounts, setResubmissionCounts] = useState(null)
    const api = useContext(ApiContext)

    useEffect(() => {
        axios.get(api.resubmissions)
            .then(response => setResubmissions(response[0].data))
            .catch(error => console.log('Error', error))
        const resubmissionCountPromises = [
            axios.get(api.resubmissionsCount),
            axios.get(api.resubmissionsCountByInstitution),
            axios.get(api.resubmissionsCountByTic),
            axios.get(api.resubmissionsCountByTherapeuticArea),
        ]
        Promise.all(resubmissionCountPromises)
            .then((response) => {
                setResubmissionCounts({
                    overall: response[0].data,
                    byInstitution: response[1].data,
                    byTic: response[2].data,
                    byTherapeuticArea: response[3].data,
                })
            })
            .catch(error => console.log('Error', error))
    }, [])
    
    return (
        <div>
            <Heading>Resubmitted Proposals</Heading>
            
            <Subheading>Resubmissions</Subheading>
            {
                resubmissions ? (
                    <pre>
                        { JSON.stringify(resubmissions, null, 2) }
                    </pre>
                ) : (
                    <CircularLoader />
                )
            }

            <Subheading>Resubmission Counts</Subheading>
            {
                resubmissionCounts ? (
                    <pre>
                        { JSON.stringify(resubmissionCounts, null, 2) }
                    </pre>
                ) : (
                    <CircularLoader />
                )
            }
        </div>
    )
}

export default withStyles(styles, { withTheme: true })(Resubmissions)
