import React from 'react'
import { Grid } from '@material-ui/core'

import Heading from '../../../components/Typography/Heading'
import Paragraph from '../../../components/Typography/Paragraph'

import BubbleChart from '../../../components/Charts/BubbleChart'
import AreaChart from '../../../components/Charts/AreaChart'

const proposalsIndex = (props) => {
    return (
        <div>
            <Heading>Proposals</Heading>

            <Paragraph>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quibusdam quas rem id sequi architecto,
                tenetur illo, sed reprehenderit ad quis nostrum, sint esse a eaque necessitatibus quo rerum suscipit
                distinctio voluptate corporis in quos. Nostrum inventore, veniam officiis ducimus, unde dolor. Dolores
                ratione, illum ipsam commodi veniam recusandae tempore dicta repellat omnis quaerat libero, fugiat optio!
            </Paragraph>

            <Grid container>
                <Grid item xs={ 12 } sm={ 6 }>
                    <BubbleChart />
                </Grid>
                <Grid item xs={ 12 } sm={ 6 }>
                    <AreaChart />
                </Grid>
            </Grid>
        </div>
    )
}

export default proposalsIndex