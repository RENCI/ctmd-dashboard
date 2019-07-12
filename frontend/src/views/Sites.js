import React, { useContext } from 'react'
import { makeStyles, useTheme } from '@material-ui/styles'
import { StoreContext } from '../contexts/StoreContext'
import { Grid, List, ListItem, Avatar, ListItemText, Card, CardHeader, CardContent } from '@material-ui/core'
import { FormControl, FormLabel, Select, MenuItem, OutlinedInput } from '@material-ui/core'
import {
    AccountBalance as InstitutionIcon,
    Assignment as TicIcon,
} from '@material-ui/icons'
import { Heading } from '../components/Typography/Typography'
import SitesTable from '../components/Tables/SitesTable'

const useStyles = makeStyles(theme => ({
    card: { },
    cardActions: {
        flex: '3 0 auto',
    },
    details: {
        width: '100%',
    },
}))

const SitesPage = props => {
    const [store, ] = useContext(StoreContext)
    const classes = useStyles()

    return (
        <div>
            <Heading>Sites</Heading>
            
            <SitesTable sites={ store.sites } paging={ true } />
        </div>
    )
}

export default SitesPage