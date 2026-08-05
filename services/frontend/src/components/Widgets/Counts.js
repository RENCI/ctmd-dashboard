import React, { useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/styles'
import { Grid } from '@material-ui/core'
import { CircularLoader } from '../../components/Progress/Progress'
import { Widget } from './Widget'
import { useProposals } from '../../hooks'

const useStyles = makeStyles(theme => ({
    cardHeader: { },
    cardContent: {
        fontWeight: 'bold',
        display: 'flex',
        flexDirection: 'column',
        [theme.breakpoints.up('md')]: {
            flexDirection: 'row',
        },
    },
    detail: {
        display: 'inline-block',
        textAlign: 'center',
        [theme.breakpoints.up('sm')]: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
        }
    },
    value: {
        color: theme.palette.secondary.light,
        fontSize: '350%',
        textAlign: 'center',
    },
    description: {
        color: theme.palette.primary.light,
        opacity: '0.75',
        fontSize: '125%',
        textAlign: 'center',
    },
    actions: {
        display: 'flex',
        justifyContent: 'flex-end'
    },
}))

export const Counts = props => {
    const proposals = useProposals()
    const [grantYearStart, setGrantYearStart] = useState()
    const [grantYearEnd, setGrantYearEnd] = useState()
    const classes = useStyles()
    const today = new Date()
    const todayYYYYMM = `${ today.getFullYear() }-${ ('0' + (today.getMonth() + 1)).slice(-2) }`

    useEffect(() => {
        // The CTMD grant year runs May 1 – April 30. If we're in May (month index 4)
        // or later, the current grant year started May 1 this calendar year;
        // otherwise (Jan–Apr) it started May 1 last year.
        const startYear = today.getMonth() >= 4 ? today.getFullYear() : today.getFullYear() - 1
        setGrantYearStart(`${ startYear }-05-01`)
        setGrantYearEnd(`${ startYear + 1 }-04-30`)
    }, [proposals])

    return (
        <Widget title="Proposal Submissions at a Glance">
            <Grid container spacing={ 8 }>
                <Grid item xs={ 12 } sm={ 4 } className={ classes.detail }>
                    <span className={ classes.value }>
                        { proposals ? proposals.length : <CircularLoader /> }
                    </span> <span className={ classes.description }>Total</span>
                </Grid>
                <Grid item xs={ 12 } sm={ 4 } className={ classes.detail }>
                    <span className={ classes.value }>
                        {
                            proposals
                            ? proposals.filter(
                                ({ dateSubmitted }) => dateSubmitted && grantYearStart <= dateSubmitted && dateSubmitted <= grantYearEnd
                            ).length
                            : <CircularLoader />
                        }
                    </span> <span className={ classes.description }>This Grant Year</span>
                </Grid>
                <Grid item xs={ 12 } sm={ 4 } className={ classes.detail }>
                    <span className={ classes.value }>
                        {
                            proposals
                            ? proposals.filter(
                                ({ dateSubmitted }) => dateSubmitted && dateSubmitted.substring(0, 7) === todayYYYYMM
                            ).length
                            : <CircularLoader />
                        }
                    </span> <span className={ classes.description }>This Month</span>
                </Grid>
            </Grid>
        </Widget>
    )
}
