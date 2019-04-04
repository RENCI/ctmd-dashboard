import React, { useContext } from 'react'
import { NavLink }from 'react-router-dom'
import { makeStyles, useTheme } from '@material-ui/styles'
import { Grid, Card, CardContent, CardHeader, CardActions, Button } from '@material-ui/core'
import { KeyboardArrowRight as RightIcon } from '@material-ui/icons'
import { StoreContext } from '../../contexts/StoreContext'
import { CircularLoader } from '../../components/Progress/Progress'

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

const Count = props => {
    const [store, ] = useContext(StoreContext)
    const classes = useStyles()
    const theme = useTheme()
    const today = new Date()
    const todayYYYYMM = `${ today.getFullYear() }-${ ('0' + (today.getMonth() + 1)).slice(-2) }`
    return (
        <Card>
            <CardHeader title="Submissions at a Glance" className={ classes.cardHeader }/>
            <CardContent className={ classes.cardContent }>
                <Grid container spacing={ 4 * theme.spacing.unit }>
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
                                    ({ dateSubmitted }) => dateSubmitted && dateSubmitted.substring(0, 4) === todayYYYYMM.substring(0, 4)
                                ).length
                                : <CircularLoader />
                            }
                        </span> <span className={ classes.description }>This Year</span>
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
            </CardContent>
            <CardActions className={ classes.actions }>
                <Button component={ NavLink } to="/proposals">Browse Proposals<RightIcon /></Button>
            </CardActions>
        </Card>
    )
}

export default Count