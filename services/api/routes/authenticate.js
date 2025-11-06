const express = require('express')
const router = express.Router()
const authenticateController = require('../controllers/authenticate')

// NOTE 2025-01-05: This is the legacy authentication endpoint used by production.
// TIN calls this endpoint after user clicks graphics: /authenticate/v1/authorize
//
// FUTURE CONSIDERATION: This endpoint structure (/authenticate/v1/authorize) is inconsistent
// with the rest of the API which uses /api/* paths. Consider migrating to /api/auth/authorize
// and updating TIN's configuration. This would require coordination with TIN team.
//
// The /authenticate path exists at the root level (not under /api) because the old separate
// auth service was deployed at the root. When we consolidated services, we kept the path
// for backwards compatibility with TIN's hardcoded URLs.

router.route('/v1/authorize').get(authenticateController.authorize)

module.exports = router
