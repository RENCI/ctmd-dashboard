import React, { useState } from 'react'
import { Switch, Route } from 'react-router-dom'
import { makeStyles } from '@material-ui/styles'
import { CssBaseline } from '@material-ui/core'
import ScrollToTop from './utils/ScrollToTop'
import { MenuTray } from './components/Menus/MainMenu'
import { HomePage } from './views/Index'
import { SettingsPage } from './views/Settings'
import {
    ProposalsListPage,
    ProposalReportPage,
    ProposalsByOrganization,
    ProposalsByTic,
    ProposalsByStatus,
    ProposalsByTherapeuticArea,
    ProposalsByDate,
    ProposalsByApprovedServices,
    ProposalsByRequestedServices,
} from './views/Proposals'
import { StudiesListPage, StudyReportPage } from './views/Studies'
import { CollaborationsPage } from './views/Collaborations'
import { CtsasPage } from './views/Ctsas'
import { SitesPage } from './views/Sites'

const useStyles = makeStyles(theme => ({
    layout: {
        display: 'flex',
        backgroundColor: `${ theme.palette.grey[100] }`,
    },
    menuToggleButton: {
        transform: 'translateX(0)',
        transition: 'transform 250ms, opacity 500ms',
        transitionDelay: '500ms',
        opacity: 0.75,
        position: 'absolute',
        left: '0.5rem',
        top: '0.5rem',
        [theme.breakpoints.up('sm')]: {
            transform: 'translateX(-150%)',
            opacity: 0,
        },
    },
    main: {
        minHeight: '100vh',
        flexGrow: 1,
        padding: `${ theme.spacing(4) }px`,
        marginLeft: '5rem',
        transition: 'padding-top 250ms',
    },
}))

const Dashboard = props => {
    const classes = useStyles()
    
    return (
        <div className={ classes.layout }>
            <MenuTray />
            <main className={ classes.main }>
                <CssBaseline />
                <ScrollToTop>
                    <Switch>
                        <Route exact path="/settings" component={ SettingsPage }/>
                        <Route exact path="/proposals/:id(\d+)" component={ ProposalReportPage }/>
                        <Route exact path="/proposals" component={ ProposalsListPage }/>
                        <Route path="/proposals/organization" component={ ProposalsByOrganization }/>
                        <Route path="/proposals/tic" component={ ProposalsByTic }/>
                        <Route path="/proposals/status" component={ ProposalsByStatus }/>
                        <Route path="/proposals/therapeutic-area" component={ ProposalsByTherapeuticArea }/>
                        <Route path="/proposals/date" component={ ProposalsByDate }/>
                        <Route path="/proposals/requested-services" component={ ProposalsByRequestedServices }/>
                        <Route path="/proposals/approved-services" component={ ProposalsByApprovedServices }/>
                        <Route path="/collaborations" component={ CollaborationsPage }/>
                        <Route exact path="/studies" component={ StudiesListPage }/>
                        <Route exact path="/studies/:proposalID" component={ StudyReportPage }/>
                        <Route path="/ctsas" component={ CtsasPage }/>
                        <Route path="/sites" component={ SitesPage }/>
                        <Route path="/" component={ HomePage }/>
                    </Switch>
                </ScrollToTop>
            </main>
        </div>
    )
}

export default Dashboard