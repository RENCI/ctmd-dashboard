import React, { useContext } from 'react'
import { StoreContext } from '../../contexts/StoreContext'
import { Grid, List, ListItem, Avatar, ListItemText, Card, CardHeader, CardContent } from '@material-ui/core'
import { FormControl, FormLabel, Select, MenuItem, OutlinedInput } from '@material-ui/core'
import {
    AccountBalance as InstitutionIcon,
    Assignment as TicIcon,
} from '@material-ui/icons'
import { Heading } from '../../components/Typography'
import SitesTable from '../../components/Tables/SitesTable'

export const SitesListPage = props => {
    const [store, ] = useContext(StoreContext)

    return (
        <div>
            <Heading>Sites</Heading>
            
            <SitesTable sites={ store.sites } paging={ true } />
        </div>
    )
}
