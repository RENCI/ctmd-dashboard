import React from 'react'
import { Link } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'
import {
    Grid,
    Card,
    CardActions,
    CardContent,
    CardMedia,
    Button,
} from '@material-ui/core'
import {
    BarChart as BarChartIcon,
    Dashboard as DashboardIcon,
} from '@material-ui/icons'

import Page from '../components/Layout/Page'
import Heading from '../components/Typography/Heading'
import Paragraph from '../components/Typography/Paragraph'
import TextLink from '../components/Typography/TextLink'

const styles = (theme) => ({
    root: { },
    grid: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2 * theme.spacing.unit,
        [theme.breakpoints.down('xs')]: {
            flexDirection: 'column',
            width: '100%',
        },
    },
    card: {
        flex: '1 1 200px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        [theme.breakpoints.down('xs')]: {
            width: '100%',
            flex: '1 1 auto',
        }
    },
    spacer: {
        width: '16px',
        height: '16px',
    },
    cardMedia: {
        height: 240,
        width: '100%',
    },
    cardContent: {
        flex: 1,
    },
    cardActions: {
        textAlign: 'center',
        display: 'flex',
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around',
        [theme.breakpoints.down('xs')]: {
            flexDirection: 'column',
        },
    },
    cardButton: {
        marginBottom: 2 * theme.spacing.unit,
        [theme.breakpoints.down('xs')]: {
            width: `calc(100% - ${ 2 * theme.spacing.unit }px)`,
        },
    },
    buttonIcon: {
        marginRight: theme.spacing.unit,
    },
})

const index = (props) => {
    const { classes } = props

    return (
        <Page>
            <Paragraph>
                The Duke/Vanderbilt Trial Innovation Center provides consultation and research solutions to investigators
                who are collaborating with the Trial Innovation Network on multicenter clinical trials and studies.
                Partnerships include <strong>access to the resources and expertise of more than 60 medical research institutions</strong>,
                including the <TextLink external to="https://www.ctsi.duke.edu/">Duke Clinical and Translational Science Institute</TextLink>.
                Together, we’re committed to improving the quality and cost of clinical research
                so we can bring more treatments to more patients in less time.
            </Paragraph>

            <Paragraph>
                For more information about the Trial Innovation Network and proposal submission,
                visit <TextLink external to="https://trialinnovationnetwork.org">https://trialinnovationnetwork.org</TextLink>.
            </Paragraph>

            <Grid container spacing={ 0 } className={ classes.grid }>
                <Grid item xs={ 12 } sm={ 6 } component={ Card } className={ classes.card }>
                    <CardMedia
                        className={ classes.cardMedia }
                        image="https://picsum.photos/400/252?random"
                        title="Lorem ipsum dolor."
                    />
                    <CardContent className={ classes.cardContent }>
                        <Heading>Reports</Heading>
                        <Paragraph>
                            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Officia expedita tempore voluptas dolore repellat minus sed quos, nostrum, repudiandae doloremque.
                        </Paragraph>
                        <Paragraph>
                            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatum aliquid dolorum exercitationem?
                        </Paragraph>
                    </CardContent>
                    <CardActions className={ classes.cardActions }>
                        <Button size="large" variant="outlined" className={ classes.cardButton }
                            color="primary" component={ Link } to="/reports"
                        ><BarChartIcon className={ classes.buttonIcon }/>View Reports</Button>
                    </CardActions>
                </Grid>
                <Grid item className={ classes.spacer } />
                <Grid item xs={ 12 } sm={ 6 } component={ Card } className={ classes.card }>
                    <CardMedia
                        className={ classes.cardMedia }
                        image="https://picsum.photos/400/250?random"
                        title="Lorem ipsum dolor."
                    />
                    <CardContent className={ classes.cardContent }>
                        <Heading>Dashboard</Heading>
                        <Paragraph>
                            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sunt veniam magnam quia veritatis error vel illum. Rem, sequi suscipit in eius quibusdam dicta facere magnam beatae odio amet, maxime, asperiores modi esse, voluptates corrupti velit qui iste fuga numquam mollitia!
                        </Paragraph>
                    </CardContent>
                    <CardActions className={ classes.cardActions }>
                        <Button size="large" variant="outlined" className={ classes.cardButton }
                            color="primary" component={ Link } to="/dashboard"
                        ><DashboardIcon className={ classes.buttonIcon }/>Access Dashboard</Button>
                    </CardActions>
                </Grid>
            </Grid>
            <Grid container spacing={ 0 } className={ classes.grid }>
                <Grid item xs={ 12 } component={ Card }>
                    <CardMedia
                        className={ classes.cardMedia }
                        image="https://picsum.photos/800/250?random"
                        title="Lorem ipsum dolor."
                    />
                    <CardContent className={ classes.cardContent }>
                        <Heading>The Proposal Process</Heading>
                        <Paragraph>
                            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Officia expedita tempore voluptas dolore repellat minus sed quos, nostrum, repudiandae doloremque.
                        </Paragraph>
                        <Paragraph>
                            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatum aliquid dolorum exercitationem?
                        </Paragraph>
                    </CardContent>
                    <CardActions className={ classes.cardActions }>
                        <Button size="large" variant="outlined"
                            color="primary" component={ Link } to="/about"
                            className={ classes.cardButton }
                        >Learn More</Button>
                        <Button size="large" variant="outlined"
                            color="secondary" component={ Link } to="/start-proposal"
                            className={ classes.cardButton }
                        >Start a Proposal</Button>
                    </CardActions>
                </Grid>
            </Grid>
        </Page>
    )
}

export default withStyles(styles)(index)