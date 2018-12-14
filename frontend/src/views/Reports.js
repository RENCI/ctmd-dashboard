import React from 'react'
import { Grid } from '@material-ui/core'

import Page from '../components/Layout/Page'
import Heading from '../components/Typography/Heading'
import Paragraph from '../components/Typography/Paragraph'
import BarGraph from '../components/Charts/BarGraph'
import BubbleChart from '../components/Charts/BubbleChart'
import LineGraph from '../components/Charts/LineGraph'
import AreaChart from '../components/Charts/AreaChart'

const reportsPage = (props) => {
    return (
        <Page>
            <Heading>Reports</Heading>

            <Paragraph>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quibusdam quas rem id sequi architecto,
                tenetur illo, sed reprehenderit ad quis nostrum, sint esse a eaque necessitatibus quo rerum suscipit
                distinctio voluptate corporis in quos. Nostrum inventore, veniam officiis ducimus, unde dolor. Dolores
                ratione, illum ipsam commodi veniam recusandae tempore dicta repellat omnis quaerat libero, fugiat optio!
            </Paragraph>
            
            <Grid container>
                <Grid item xs={ 12 } sm={ 6 }>
                    <BarGraph />
                </Grid>
                <Grid item xs={ 12 } sm={ 6 }>
                    <BubbleChart />
                </Grid>
                <Grid item xs={ 12 } sm={ 6 }>
                    <LineGraph />
                </Grid>
                <Grid item xs={ 12 } sm={ 6 }>
                    <AreaChart />
                </Grid>
            </Grid>
        </Page>
    )
}

export default reportsPage