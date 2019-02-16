import React, { Fragment, useState, useEffect } from 'react'
import { withStyles } from '@material-ui/core/styles'
import axios from 'axios'
import classnames from 'classnames'
import { Card, CardContent, TextField, Button, Menu, MenuItem } from '@material-ui/core'
import { CircularLoader } from '../../components/Progress/Progress'
import Heading from '../../components/Typography/Heading'
import Subheading from '../../components/Typography/Subheading'
import { ResponsiveBar } from '@nivo/bar'

const apiRoot = (process.env.NODE_ENV === 'production') ? 'https://pmd.renci.org/api/' : 'http://localhost:3030/'
const apiUrl = {
    overall: apiRoot + 'proposals/submitted-for-services/count',
    countByInstitution: apiRoot + 'proposals/submitted-for-services/count/by-institution',
    countByTic: apiRoot + 'proposals/submitted-for-services/count/by-tic',
    countByTherapeuticArea: apiRoot + 'proposals/submitted-for-services/count/by-therapeutic-area',
    countByYear: apiRoot + 'proposals/submitted-for-services/count/by-year',
    countByMonth: apiRoot + 'proposals/submitted-for-services/count/by-month',
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

const SubmittedForServices = (props) => {
    const { classes, theme } = props
    const [submissionCounts, setSubmissionCounts] = useState(null)

    useEffect(() => {
        const submissionCountPromises = [
            axios.get(apiUrl.overall),
            axios.get(apiUrl.countByInstitution),
            axios.get(apiUrl.countByTic),
            axios.get(apiUrl.countByTherapeuticArea),
            axios.get(apiUrl.countByYear),
            axios.get(apiUrl.countByMonth),
        ]
        Promise.all(submissionCountPromises)
            .then((response) => {
                setSubmissionCounts({
                    overall: response[0].data.count,
                    byInstitution: response[1].data,
                    byTic: response[2].data,
                    byTherapeuticArea: response[3].data,
                    byYear: response[4].data,
                    byMonth: response[5].data,
                })
            })
            .catch(error => console.log('Error', error))
    }, [])

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    const defaultBarChartAttributes = {
        layout: "vertical",
        margin: { top: 64, right: 32, bottom: 64, left: 96 },
        padding: 0.3,
        colors: Object.values(theme.palette.extended),
        colorBy: "value",
        borderColor: "inherit:darker(1.6)",
        axisTop: false,
        axisRight: false,
        enableGridY: false,
        axisBottom: {
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            // legend: 'Year',
            legendPosition: 'middle',
            legendOffset: 32
        },
        axisLeft: {
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Number of Proposals',
            legendPosition: 'middle',
            legendOffset: -64
        },
        labelSkipWidth: 12,
        labelSkipHeight: 12,
        labelTextColor: "inherit:darker(1.6)",
        animate: true,
        motionStiffness: 90,
        motionDamping: 15,
    }

    return (
        <div>
            <Heading>Submitted for Services</Heading>

            {
                submissionCounts ? (
                    <Fragment>
                        <Card className={ classes.card }>
                            <CardContent>
                                <Subheading>Proposals Submitted for Services by Institution</Subheading>
                                {
                                    submissionCounts.byInstitution.map(
                                        org => <div><strong>{ org.org_name }</strong>: { org.count }</div>
                                    )
                                }
                            </CardContent>
                        </Card>

                        <Card className={ classes.card }>
                            <CardContent style={{ height: '300px' }}>
                                <ResponsiveBar { ...defaultBarChartAttributes }
                                    data={ submissionCounts.byTic }
                                    keys={ ['count'] }
                                    indexBy="tic_name"
                                />
                            </CardContent>
                        </Card>

                        <Card className={ classes.card }>
                            <CardContent>
                                <Subheading>Proposals Submitted for Services by Therapeutic Area</Subheading>
                                {
                                    submissionCounts.byTherapeuticArea.map(
                                        area => <div><strong>{ area.therapeutic_area }</strong>: { area.count }</div>
                                    )
                                }
                            </CardContent>
                        </Card>

                        <Card className={ classes.card }>
                            <CardContent style={{ height: '400px' }}>
                                <ResponsiveBar { ...defaultBarChartAttributes }
                                    data={ submissionCounts.byYear }
                                    keys={ ['count'] }
                                    indexBy="year"
                                />
                            </CardContent>
                        </Card>

                        <Card className={ classes.card }>
                            <CardContent style={{ height: '400px' }}>
                                <ResponsiveBar { ...defaultBarChartAttributes }
                                    data={ submissionCounts.byMonth.map(
                                        ({ month, count }) => ({
                                            month: months[month - 1],
                                            count: count
                                        })
                                    )}
                                    keys={ ['count'] }
                                    indexBy="month"
                                />
                            </CardContent>
                        </Card>
                    </Fragment>
                ) : (
                    <CircularLoader />
                )
            }
        </div>
    )
}

export default withStyles(styles, { withTheme: true })(SubmittedForServices)
