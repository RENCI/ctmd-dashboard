import React, { Fragment } from 'react'

import { Grid } from '@material-ui/core'

import BubbleChart from '../../components/Charts/BubbleChart'
import AreaChart from '../../components/Charts/AreaChart'

import Heading from '../../components/Typography/Heading'
import Subheading from '../../components/Typography/Subheading'
import Paragraph from '../../components/Typography/Paragraph'

import ProposalsInEachStage from '../../components/Charts/Bar/ProposalsInEachStage'

const proposalsPage = (props) => {
    return (
        <Fragment>
            <Heading>Proposals</Heading>

            <Paragraph>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Culpa illum, dolores voluptatem, delectus velit vel sint eius rerum modi aliquid debitis assumenda minima magnam! Nemo, consequatur sint commodi deserunt optio ducimus, quaerat similique, atque tempore assumenda ex dolorum cum ullam eos ea, id fugit sunt! Voluptatem nisi delectus cumque maxime a fugit nam, sed, dolores soluta similique? Totam quisquam est officia et nihil quas deserunt ipsam voluptas.
            </Paragraph>

            <Subheading>
                Proposals by Stage
            </Subheading>

            <Paragraph>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                Distinctio dolores corrupti, beatae quam, dolorum adipisci incidunt, temporibus accusantium fugit iure odio amet.
            </Paragraph>

            <ProposalsInEachStage />

            <Subheading>General Reports</Subheading>

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

        </Fragment>
    )
}

export default proposalsPage
