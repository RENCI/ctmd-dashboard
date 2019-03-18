import React, { useState, useContext, useEffect } from 'react'
import { makeStyles } from '@material-ui/styles'
import axios from 'axios'
import { ApiContext } from '../contexts/ApiContext'
import { Card, CardHeader, CardActions, CardContent, Button } from '@material-ui/core'
import { KeyboardArrowLeft as LeftIcon, KeyboardArrowRight as RightIcon } from '@material-ui/icons'
import StudyMetricsForm from '../components/Forms/Metrics'
import Heading from '../components/Typography/Heading'

const useStyles = makeStyles(theme => ({
    navigation: {
        display: 'flex',
        justifyContent: 'stretch',
    },
    flexer: {
        flex: 1,
    }
}))

const StudyMetricsPage = props => {
    const [metrics, setMetrics] = useState()
    const [current, setCurrent] = useState(0)
    const api = useContext(ApiContext)
    const classes = useStyles()

    const getStudyMetrics = async () => {
        await axios.get(api.studyMetrics)
            .then(response => setMetrics(response.data))
            .catch(error => console.log('Error', error))
    }

    useEffect(() => {
        getStudyMetrics()
    }, [])

    const handleNavigate = value => event => {
        setCurrent((current + value + metrics.length) % metrics.length)
        console.log(current)
    }

    const handleOpenNewMetricForm = () => {
        console.log('New metric...')
    }

    return (
        <div>

            <Heading>Study Metrics</Heading>
            
            {
                metrics
                ? (
                    <Card>
                        <CardHeader
                            title={ `${ metrics[current].studyAcronym } (${ metrics[current].id })` }
                            action={
                                <Button variant="contained" color="primary" onClick={ handleOpenNewMetricForm }>
                                    Add New
                                </Button>
                            }
                        />
                        <div className={ classes.navigation }>
                            <Button color="secondary" onClick={ handleNavigate(-1) }>
                                <LeftIcon /> PREV
                            </Button>
                            <div className={ classes.flexer } />
                            <Button color="secondary" onClick={ handleNavigate(1) }>
                                NEXT <RightIcon />
                            </Button>
                        </div>
                        <CardContent>
                            <pre>{ JSON.stringify(metrics[current], null, 2)}</pre>
                        </CardContent>
                    </Card>
                ) : 'Waiting for response...'
            }
            
            <StudyMetricsForm/>
        
        </div>
    )
}

export default StudyMetricsPage