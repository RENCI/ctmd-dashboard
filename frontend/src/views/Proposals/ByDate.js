import React, { useState, useEffect, useContext } from 'react'
import { makeStyles } from '@material-ui/styles'
import { StoreContext } from '../../contexts/StoreContext'
import { Grid, Card, CardContent, TextField, Button, Menu, MenuItem } from '@material-ui/core'
import { Heading } from '../../components/Typography/Typography'
import BrowseMenu from '../../components/Menus/BrowseMenu'
import ProposalsTable from '../../components/Tables/ProposalsTable'

const useStyles = makeStyles(theme => ({
    page: { },
    card: {
        marginBottom: theme.spacing(2),
        backgroundColor: theme.palette.grey[100],
    },
    datePickersContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing(2),
    },
    dateField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: 200,
    },
    filterButton: {
        margin: `0 ${ theme.spacing(1) }px`
    },
    table: {
        padding: theme.spacing(2),
        overflowY: 'scroll',
    },
}))

const PresetSelector = (props) => {
    const { selectionHandler } = props
    const [anchorEl, setAnchorEl] = useState(null)

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget)
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

    return (
        <div>
            <Button
                aria-owns={ anchorEl ? 'fy-presets-menu' : undefined }
                aria-haspopup="true"
                onClick={ handleClick }
            >
                Presets
            </Button>
            <Menu
                id="fy-presets-menu"
                anchorEl={ anchorEl }
                open={ Boolean(anchorEl) }
                onClose={ handleClose }
            >
                {
                    ['2017', '2018', '2019'].map(year => {
                        const presetName = `fy${ year }`
                        return (
                            <MenuItem key={ presetName } onClick={ selectionHandler(presetName) }>
                                Fiscal Year { year }
                            </MenuItem>
                        )
                    })
                }
            </Menu>
        </div>
    )
}

const ProposalsByDate = (props) => {
    const classes = useStyles()
    const [store, ] = useContext(StoreContext)
    const [displayedProposals, setDisplayedProposals] = useState([])
    const [dates, setDates] = useState({
        start: '2016-01-01',
        end: `${ (new Date()).getFullYear() }-12-31`,
    })
    const [tableTitle, setTableTitle] = useState(`From ${ dates.start } to ${ dates.end }`)

    useEffect(() => {
        setDisplayedProposals(store.proposals)
    }, [store.proposals])
    
    const selectProposals = () => {
        const filteredProposals = store.proposals.filter(proposal => {
            const proposalDate = new Date(proposal.dateSubmitted)
            return (new Date(dates.start) <= proposalDate && proposalDate <= new Date(dates.end))
        })
        setTableTitle(`From ${ dates.start } to ${ dates.end }`)
        setDisplayedProposals(filteredProposals)
    }

     const handleChange = name => event => {
        setDates({ ...dates, [name]: event.target.value });
    }

    const selectPreset = presetName => event => {
        switch (presetName) {
            case 'fy2017':
                setDates({ start: '2016-06-30', end: '2017-07-01' })
                return
            case 'fy2018':
                setDates({ start: '2017-06-30', end: '2018-07-01' })
                return
            case 'fy2019':
                setDates({ start: '2018-06-30', end: '2019-07-01' })
                return
            default:
                return
        }
    }

    return (
        <div>
            <Heading>
                Proposals by Submission Date
                <BrowseMenu />
            </Heading>
            
            <Grid container spacing={ 16 }>
                <Grid item xs={ 12 }>
                    <Card>
                        <CardContent className={ classes.datePickersContainer }>
                            <div>
                                <TextField
                                    id="startDate"
                                    label="FROM"
                                    type="date"
                                    value={ dates.start }
                                    className={ classes.dateField }
                                    InputLabelProps={{ shrink: true, }}
                                    onChange={ handleChange('start') }
                                />
                            </div>

                            <div>
                                <TextField
                                    id="endDate"
                                    label="TO"
                                    type="date"
                                    value={ dates.end }
                                    className={ classes.dateField }
                                    InputLabelProps={{ shrink: true, }}
                                    onChange={ handleChange('end') }
                                />
                            </div>

                            <Button
                                className={ classes.filterButton }
                                variant="contained"
                                size="small"
                                color="secondary"
                                onClick={ selectProposals }
                            >Filter</Button>

                            <PresetSelector selectionHandler={ selectPreset }/>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={ 12 }>
                    <ProposalsTable title={ tableTitle } proposals={ displayedProposals } paging={ false } />
                </Grid>
            </Grid>

        </div>
    )
}

export default ProposalsByDate