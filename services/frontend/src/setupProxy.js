/**
 * CRA dev-server proxy configuration.
 *
 * Mirrors the nginx rules in helm-charts/ctmd-dashboard/templates/frontend.yaml
 * so that `npm start` works against real backend services without a full
 * image rebuild.
 *
 * Default targets assume both services are port-forwarded to localhost:
 *   kubectl port-forward svc/ctmd-api       -n ctmd 3030:3030
 *   kubectl port-forward svc/ctmd-pipeline2 -n ctmd 5000:5000
 *
 * Override targets via environment variables if needed:
 *   API_PROXY_TARGET=http://localhost:3030 npm start
 *   DATA_PROXY_TARGET=http://localhost:5000 npm start
 */
const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: process.env.API_PROXY_TARGET || 'http://localhost:3030',
      changeOrigin: true,
      // nginx uses `location /api/ { proxy_pass http://ctmd-api:3030/; }`, whose
      // trailing slashes strip the `/api` prefix. Mirror that here so requests
      // reach the API's real routes (e.g. /api/auth_status -> /auth_status).
      pathRewrite: { '^/api': '' },
    })
  )

  app.use(
    '/data',
    createProxyMiddleware({
      target: process.env.DATA_PROXY_TARGET || 'http://localhost:5000',
      changeOrigin: true,
      pathRewrite: { '^/data': '' },
    })
  )
}
