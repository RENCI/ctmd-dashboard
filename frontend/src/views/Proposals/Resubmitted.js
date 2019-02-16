import React, { useState, useEffect } from 'react'
import { withStyles } from '@material-ui/core/styles'
import axios from 'axios'
import classnames from 'classnames'
import { Card, CardContent, TextField, Button, Menu, MenuItem } from '@material-ui/core'
import OrgPieChart from '../../components/Charts/ProposalsPie'
import { CircularLoader } from '../../components/Progress/Progress'
import Heading from '../../components/Typography/Heading'
import Subheading from '../../components/Typography/Subheading'
import Paragraph from '../../components/Typography/Paragraph'
import ProposalsTable from '../../components/Charts/ProposalsTable'

const apiRoot = (process.env.NODE_ENV === 'production') ? 'https://pmd.renci.org/api/' : 'http://localhost:3030/'
const apiUrl = {
    resubmissions: apiRoot + 'proposals/resubmissions',
    resubmissionsCount: apiRoot + 'proposals/resubmissions/count',
    resubmissionsCountByInstitution: apiRoot + 'proposals/resubmissions/count/by-institution',
    resubmissionsCountByTic: apiRoot + 'proposals/resubmissions/count/by-tic',
    resubmissionsCountByTherapeuticArea: apiRoot + 'proposals/resubmissions/count/by-therapeutic-area',
}

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

    useEffect(() => {
        axios.get(apiUrl.resubmissions)
            .then((response) => setResubmissions(response[0].data))
            .catch(error => console.log('Error', error))
        const resubmissionCountPromises = [
            axios.get(apiUrl.resubmissionsCount),
            axios.get(apiUrl.resubmissionsCountByInstitution),
            axios.get(apiUrl.resubmissionsCountByTic),
            axios.get(apiUrl.resubmissionsCountByTherapeuticArea),
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
