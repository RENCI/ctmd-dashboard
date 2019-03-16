import React, { useContext } from 'react'
import { makeStyles, useTheme } from '@material-ui/styles'
import { Grid, Card, CardContent, CardHeader } from '@material-ui/core'
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
        color: theme.palette.secondary.light,
        textAlign: 'left',
        [theme.breakpoints.up('sm')]: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
        }
    },
    value: {
        color: theme.palette.secondary.main,
        fontSize: '250%',
        textAlign: 'center',
    },
    description: {
        color: theme.palette.secondary.light,
        fontSize: '125%',
        textAlign: 'center',
    },
}))

const Count = props => {
    const { value } = props
    const [store, setStore] = useContext(StoreContext)
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
        </Card>
    )
}

export default Count