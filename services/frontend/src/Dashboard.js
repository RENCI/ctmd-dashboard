import React, { useContext } from 'react'
import { AuthContext } from './contexts'
import { Routes, Route } from 'react-router-dom'
import { makeStyles } from '@material-ui/styles'
import { CssBaseline } from '@material-ui/core'
import ScrollToTop from './utils/ScrollToTop'
import { MenuTray } from './components/Menus/MainMenu'
import {
  HomePage,
  ManagementPage,
  CollaborationsPage,
  CtsasPage,
  SitesPage,
  UploadsPage,
  ProfilePage,
  LoginPage,
  ExitPage,
  ProposalsListPage,
  ProposalReportPage,
  ProposalsByOrganization,
  ProposalsByTic,
  ProposalsByStatus,
  ProposalsByTherapeuticArea,
  ProposalsByDate,
  ProposalsByResourcesApproved,
  ProposalsByResourcesRequested,
  StudiesListPage,
  StudyReportPage,
} from './views'
import { RouteChangeTracker } from './RouteChangeTracker'

import { Footer } from './components/Footer'

const useStyles = makeStyles((theme) => ({
  layout: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: `${theme.palette.extended.whisperGray}`,
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
    padding: `${theme.spacing(6)}px`,
    marginLeft: '5rem',
    transition: 'padding-top 250ms',
  },
}))

const Dashboard = (props) => {
  const classes = useStyles()
  const { authenticated } = useContext(AuthContext)

  return (
    <div className={classes.layout}>
      <MenuTray />
      <main className={classes.main}>
        <CssBaseline />
        <ScrollToTop>
          {authenticated && (
            <Routes>
              <Route path="/manage" element={<ManagementPage />} />
              <Route path="/proposals/:id" element={<ProposalReportPage />} />
              <Route path="/proposals" element={<ProposalsListPage />} />
              <Route path="/proposals/organization" element={<ProposalsByOrganization />} />
              <Route path="/proposals/tic" element={<ProposalsByTic />} />
              <Route path="/proposals/status" element={<ProposalsByStatus />} />
              <Route path="/proposals/therapeutic-area" element={<ProposalsByTherapeuticArea />} />
              <Route path="/proposals/date" element={<ProposalsByDate />} />
              <Route path="/proposals/resources-requested" element={<ProposalsByResourcesRequested />} />
              <Route path="/proposals/resources-approved" element={<ProposalsByResourcesApproved />} />
              <Route path="/collaborations" element={<CollaborationsPage />} />
              <Route path="/studies" element={<StudiesListPage />} />
              <Route path="/studies/:proposalID" element={<StudyReportPage />} />
              <Route path="/ctsas" element={<CtsasPage />} />
              <Route path="/sites" element={<SitesPage />} />
              <Route path="/uploads" element={<UploadsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/logout" element={<ExitPage />} />
              <Route path="/" element={<HomePage />} />
            </Routes>
          )}
          {!authenticated && <LoginPage />}
        </ScrollToTop>
      </main>
      <Footer />
      <RouteChangeTracker />
    </div>
  )
}

export default Dashboard
