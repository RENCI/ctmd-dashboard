import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import SiteReportForm from '../components/Forms/SiteReport'
import Heading from '../components/Typography/Heading'

const styles = (theme) => ({
    root: { },
})

const sample_sites = [
    { id: 1, name: 'Out of Site', details: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Pariatur laboriosam deserunt, vitae consequatur delectus cumque nam debitis molestias repudiandae suscipit ullam, tempore, minima culpa ipsa quas. Cum et, corporis expedita.', },
    { id: 2, name: 'Site for Sore Eyes', details: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consequuntur dolorum, doloremque totam saepe! Tempore error ipsam dolorum. Consequatur beatae, sunt eius nemo cum numquam molestias similique, dolores, impedit expedita iusto.', },
    { id: 3, name: 'Out of Site, Out of Mind', details: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quis, excepturi, ea! Voluptatum nihil quibusdam temporibus, doloribus tempora vero obcaecati fugit explicabo laboriosam autem est saepe eaque. Commodi neque provident, omnis.', },
    { id: 4, name: 'Hidden in Plain Site', details: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Laborum, explicabo. Nemo voluptatum aspernatur officia esse! Nam atque perferendis, commodi optio! Non, odit, deserunt. Quam tempora, laudantium quis voluptatibus neque deleniti?', },
    { id: 5, name: 'HindSite', details: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Assumenda labore, accusantium, accusamus laborum ut vitae architecto ipsum officiis consectetur non quos esse maiores hic perferendis harum nam iusto distinctio provident.', },
]

const SiteReportPage = (props) => {
    const { classes } = props
    return (
        <div className={ classes.root }>
        
            <Heading>Site Report Card</Heading>

            <SiteReportForm sites={ sample_sites }/>
            
        </div>
    )
}

export default withStyles(styles)(SiteReportPage)