import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles'
import { Table, TableRow, TableCell, TableHead, TableBody } from '@material-ui/core'
import axios from 'axios'

const snakeCaseToNormal = (str) => {
    return str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

const VertTableCell = props => {
    const { children } = props
    return (
        <TableCell>
            <div style={{ writingMode: 'vertical-rl', }}>
                { children }
            </div>
        </TableCell>
    )
}

const styles = theme => ({
    root: { },
    head: { },
    headRow: { },
    headCell: {
        border: '1px solid #f00',
    },
    body: { },
    bodyRow: { },
    bodyCell: { },
})

class ProposalsMatrix extends Component {
    state = {
        proposals: []
    }

    async fetchData() {
        await axios.get(this.props.apiUrl)
            .then(response => {
                this.setState({
                    proposals: response.data,
                })
            })
            .catch(error => {
                console.error(`Error fetching data\nError ${error.response.status}: ${error.response.statusText}`)
            })
    }

    componentDidMount() {
        this.fetchData()
    } 

    render() {
        const { proposals } = this.state
        const { classes } = this.props
        return (
            <Table className={ classes.root }>
                <TableHead className={ classes.head }>
                    <TableRow className={ classes.headRow }>
                        <VertTableCell className={ classes.headCell }>Column One</VertTableCell>
                        <VertTableCell className={ classes.headCell }>Column Two</VertTableCell>
                        <VertTableCell className={ classes.headCell }>Column Three</VertTableCell>
                    </TableRow>
                </TableHead>
                <TableBody className={ classes.body }>
                    <TableRow className={ classes.bodyRow }>
                        <TableCell className={ classes.bodyCell }>0</TableCell>
                        <TableCell className={ classes.bodyCell }>1</TableCell>
                        <TableCell className={ classes.bodyCell }>1</TableCell>
                    </TableRow>
                    <TableRow className={ classes.bodyRow }>
                        <TableCell className={ classes.bodyCell }>1</TableCell>
                        <TableCell className={ classes.bodyCell }>0</TableCell>
                        <TableCell className={ classes.bodyCell }>0</TableCell>
                    </TableRow>
                    <TableRow className={ classes.bodyRow }>
                        <TableCell className={ classes.bodyCell }>1</TableCell>
                        <TableCell className={ classes.bodyCell }>1</TableCell>
                        <TableCell className={ classes.bodyCell }>1</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        )
    }
}

export default withStyles(styles)(ProposalsMatrix)