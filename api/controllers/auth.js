const https = require('https')
const axios = require('axios')

const AUTH_URL = process.env.AUTH_URL
const AUTH_API_KEY = process.env.FUSE_AUTH_API_KEY
const DASHBOARD_URL = process.env.DASHBOARD_URL
const AGENT = new https.Agent({
  rejectUnauthorized: false,
})

exports.auth = async (req, res) => {
  const code = req.body.code
  const urlRedirect = `${AUTH_URL}/v1/authorize?apikey=${AUTH_API_KEY}&provider=venderbilt&return_url=${DASHBOARD_URL}&code=${code}&redirect=true`
  const urlNoRedirect = `${AUTH_URL}/v1/authorize?apikey=${AUTH_API_KEY}&provider=venderbilt&return_url=${DASHBOARD_URL}&code=${code}&redirect=false`

  if (!req.session.auth_info) {
    try {
      const response = await axios.get(urlNoRedirect, { httpsAgent: AGENT })
      if (process.env.AUTH_ENV === 'development') {
        const data = {
          access_level: '1',
          email: 'dev@email.com',
          first_name: 'demo',
          last_name: 'user',
          organization: 'demo server',
          username: 'demo',
          authenticated: true,
        }
        req.session.auth_info = data
        res.redirect(urlRedirect)
        res.end()
      } else if (response.status === 200) {
        const data = response.data
        data.authenticated = true
        req.session.auth_info = data

        res.redirect(urlRedirect)
        res.end()
      }
    } catch (err) {
      console.log(err)
      res.status(400).send('error')
    }
  } else {
    res.redirect(urlRedirect)
  }
}
