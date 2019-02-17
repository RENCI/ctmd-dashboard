import React, { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { ApiContext } from '../../contexts/ApiContext'
import Heading from '../../components/Typography/Heading'
import Subheading from '../../components/Typography/Subheading'
import { CircularLoader } from '../../components/Progress/Progress'

const Resubmissions = (props) => {
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

export default Resubmissions
