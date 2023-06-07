import React, { useContext, useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/styles'
import { Grid } from '@material-ui/core'
import { StoreContext } from '../../contexts/StoreContext'
import { CircularLoader } from '../../components/Progress/Progress'
import { Widget } from './Widget'

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
    const [store, ] = useContext(StoreContext)
    const [FYStartDate, setFYStartDate] = useState()
    const [FYEndDate, setFYEndDate] = useState()
    const classes = useStyles()
    const today = new Date()
    const todayYYYYMM = `${ today.getFullYear() }-${ ('0' + (today.getMonth() + 1)).slice(-2) }`
    
    useEffect(() => {
        setFYStartDate(`${ today.getMonth() > 5 ? today.getFullYear() : today.getFullYear() - 1 }-07-01`)
        setFYEndDate(`${ today.getMonth() > 5 ? today.getFullYear() + 1 : today.getFullYear() }-06-30`)
    }, [store.proposals])

    return (
        <Widget title="Proposal Submissions at a Glance">
            <Grid container spacing={ 8 }>
                <Grid item xs={ 12 } sm={ 4 } className={ classes.detail }>
                    <span className={ classes.value }>
                        { store.proposals ? store.proposals.length : <CircularLoader /> }
                    </span> <span className={ classes.description }>Total</span>
                </Grid>
                <Grid item xs={ 12 } sm={ 4 } className={ classes.detail }>
                    <span className={ classes.value }>
                        {
                            store.proposals
                            ? store.proposals.filter(
                                // ({ dateSubmitted }) => dateSubmitted && dateSubmitted.substring(0, 4) === todayYYYYMM.substring(0, 4)
                                ({ dateSubmitted }) => dateSubmitted && FYStartDate < dateSubmitted && dateSubmitted < FYEndDate
                            ).length
                            : <CircularLoader />
                        }
                    </span> <span className={ classes.description }>This Grant Year</span>
                </Grid>
                <Grid item xs={ 12 } sm={ 4 } className={ classes.detail }>
                    <span className={ classes.value }>
                        {
                            store.proposals
                            ? store.proposals.filter(
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
