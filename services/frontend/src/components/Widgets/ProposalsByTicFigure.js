import React from 'react'
import { CardContent } from '@material-ui/core'
import api from '../../Api'
import { Widget } from './Widget'

// Embeds the server-rendered "Proposals by TIC" figure on the home dashboard —
// the same SVG the TIN site used to receive on its login callback. Served by
// GET /api/graphics/proposals-by-tic-chart; the logged-in browser's session
// cookie authorizes the request (see the auth middleware in services/api/app.js).
export const ProposalsByTicFigure = () => (
  <Widget
    title="Proposals by TIC"
    subtitle="Proposals per TIC, grouped by consultation status"
    info="Live snapshot of proposals assigned to each Trial Innovation Center, stacked by status group: Initial Consultations, Comprehensive Consults, In Full Implementation, Discrete Resources, and Other."
  >
    <CardContent>
      <img
        src={ api.proposalsByTicFigure }
        alt="Proposals by TIC, grouped by consultation status"
        style={{ width: '100%', height: 'auto', display: 'block' }}
      />
    </CardContent>
  </Widget>
)
