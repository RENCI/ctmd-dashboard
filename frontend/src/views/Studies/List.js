import React, { useContext, useEffect, useState } from 'react'
import { Switch, Route } from 'react-router-dom'
import { makeStyles, useTheme } from '@material-ui/styles'
import { StoreContext } from '../../contexts/StoreContext'
import { Grid, Card, CardHeader, CardContent, Button } from '@material-ui/core'
import { NavLink } from 'react-router-dom'
import { Heading } from '../../components/Typography/Typography'
import StudiesTable from '../../components/Tables/StudiesTable'

const useStyles = makeStyles(theme => ({
    card: {
        margin: theme.spacing(1),
    },
}))

const studiesIds = [171, 186]

export const StudiesListPage = props => {
    const [store, ] = useContext(StoreContext)
    const [studies, setStudies] = useState([])
    const theme = useTheme()
    const classes = useStyles()

    useEffect(() => {
        if (store.proposals) {
            const onlyStudies = store.proposals.filter(({ proposalID }) => studiesIds.includes(proposalID))
            setStudies(onlyStudies)
        }
    }, [store.proposals])

    return (
        <div>

            <Heading>
                Studies
            </Heading>
            
            <StudiesTable studies={ studies } paging={ true } />
            
        </div>
    )
}
