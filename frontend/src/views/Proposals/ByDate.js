import React, { useState, useEffect } from 'react'
import { withStyles } from '@material-ui/core/styles'
import axios from 'axios'
import classnames from 'classnames'
import { Card, CardContent, TextField, Button, Menu, MenuItem } from '@material-ui/core'
import OrgPieChart from '../../components/Charts/ProposalsPie'
import { CircularLoader } from '../../components/Progress/Progress'
import MaterialTable from 'material-table'
import Heading from '../../components/Typography/Heading'
import Subheading from '../../components/Typography/Subheading'
import Paragraph from '../../components/Typography/Paragraph'

const apiRoot = (process.env.NODE_ENV === 'production') ? 'https://pmd.renci.org/api/' : 'http://localhost:3030/'
const apiUrl = {
    proposals: apiRoot + 'proposals',
}

const styles = (theme) => ({
    page: {
        // ...theme.mixins.debug
    },
    card: {
        marginBottom: 2 * theme.spacing.unit,
        backgroundColor: theme.palette.grey[100],
    },
    datePickersContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 2 * theme.spacing.unit,
    },
    dateField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 200,
    },
    filterButton: {
        margin: `0 ${ theme.spacing.unit }px`
    },
    table: {
        padding: 2 * theme.spacing.unit,
        overflowY: 'scroll',
    },
})

const PresetSelector = withStyles(styles)((
    (props) => {
        const { classes, selectionHandler } = props
        const [anchorEl, setAnchorEl] = useState(null)
        const [selection, setSelection] = useState(null)

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
))

const ProposalsByDate = (props) => {
    const { classes, theme } = props
    const [proposals, setProposals] = useState([])
    const [displayedProposals, setDisplayedProposals] = useState([])
    const [dates, setDates] = useState({
        start: '2016-01-01',
        end: '2019-12-31',
    })

    useEffect(() => {
        axios.get(apiUrl.proposals)
            .then((response) => {
                setProposals(response.data)
                setDisplayedProposals(response.data)
            })
            .catch(error => console.log('Error', error))
    }, [])
    
    const selectProposals = () => {
        const filteredProposals = proposals.filter(proposal => {
            const proposalDate = new Date(proposal.prop_submit)
            return (new Date(dates.start) <= proposalDate && proposalDate <= new Date(dates.end))
        })
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
            <Heading>Proposals by Date</Heading>
            
            <div className={ classes.datePickersContainer }>
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
            </div>

            <MaterialTable
                className={ classes.table }
                columns={ [
                    { title: 'Proposal ID', field: 'proposal_id', },
                    { title: 'Proposal Name', field: 'short_name', },
                    { title: 'TIC', field: 'tic_name', },
                    { title: 'Organization', field: 'org_name', },
                    { title: 'Therapeutic Area', field: 'therapeutic_area', },
                    { title: 'Submission Date', field: 'prop_submit', type: 'datetime', render: ({submission_date}) => <span>{ submission_date }</span>},
                ] }
                data={ displayedProposals }
                options={{
                    columnsButton: true,
                    exportButton: true,
                    pageSize: 15,
                    pageSizeOptions: [15, 25, 50],
                }}
                title=""
            />

        </div>
    )
}

export default withStyles(styles, { withTheme: true })(ProposalsByDate)
