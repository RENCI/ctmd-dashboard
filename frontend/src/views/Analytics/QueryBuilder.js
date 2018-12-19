import React, { Fragment } from 'react'
import { TextField, Table, TableCell, Paper, TableHead, TableRow, TableBody } from '@material-ui/core'

import Heading from '../../components/Typography/Heading'
import Subheading from '../../components/Typography/Subheading'
import Paragraph from '../../components/Typography/Paragraph'

const classes = {
    root: {
        width: '100%',
        marginTop: '24px',
        overflowX: 'auto',
    },
    table: {
        minWidth: 420,
    },
}

let id = 0
function createData(name, a, b, c, d) {
    id += 1
    return { id, name, a, b, c, d }
}

const rows = [
    createData('Row1', 159, 6.0, 24, 4.0),
    createData('Row2', 237, 9.0, 37, 4.3),
    createData('Row3', 262, 16.0, 24, 6.0),
    createData('Row4', 305, 3.7, 67, 4.3),
    createData('Row5', 356, 16.0, 49, 3.9),
]

const queryBuilderPage = (props) => {
    return (
        <Fragment>
            <Heading>Query Builder</Heading>

            <Paragraph>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ipsum doloribus distinctio praesentium asperiores quod sequi impedit porro earum vel minus reiciendis alias maxime, maiores vitae, officiis suscipit beatae sapiente incidunt. Rerum tenetur fuga praesentium iusto explicabo placeat ad beatae et alias, officia, possimus doloremque dolores nostrum? Similique provident, eligendi officiis.
            </Paragraph>

            <Subheading>
                Enter your query below to explore TIC data
            </Subheading>

            <TextField
                label="Query"
                style={{ margin: 8 }}
                placeholder="SELECT * FROM ..."
                fullWidth
                margin="normal"
                variant="outlined"
                InputLabelProps={{
                    shrink: true,
                }}
            />

            <Subheading>Results</Subheading>
            
            <Paper style={classes.root}>
                <Table style={classes.table}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell numeric>A</TableCell>
                            <TableCell numeric>B</TableCell>
                            <TableCell numeric>C</TableCell>
                            <TableCell numeric>D</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map(row => {
                            return (
                                <TableRow key={row.id}>
                                    <TableCell component="th" scope="row">
                                        {row.name}
                                    </TableCell>
                                    <TableCell numeric>{row.a}</TableCell>
                                    <TableCell numeric>{row.b}</TableCell>
                                    <TableCell numeric>{row.c}</TableCell>
                                    <TableCell numeric>{row.d}</TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </Paper>
        </Fragment>
    )
}

export default queryBuilderPage