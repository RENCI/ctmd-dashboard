const express = require("express");
const https = require("https");
const app = express();
const cors = require("cors");
const db = require("./config/database");
var multer = require("multer");
const axios = require("axios");
var cookieSession = require("cookie-session");

const NON_PROTECTED_ROUTES = ["/auth_status", "/auth"];

// CORS
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

// session
app.use(
  cookieSession({
    name: "session",
    keys: [process.env.API_SESSION_SECRET],

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

app.use((req, res, next) => {
  const authInfo =
    typeof req.session.auth_info === "undefined" ? {} : req.session.auth_info;
  if (
    NON_PROTECTED_ROUTES.includes(req.path) ||
    process.env.NODE_ENV === "developments"
  ) {
    next();
  } else {
    if (Object.keys(authInfo).length) {
      next();
    } else {
      res.status(401).send("Please login");
    }
  }
});

// Config
const PORT = process.env.API_PORT || 3030;
const AUTH_API_KEY = "TEST123"; //process.env.FUSE_AUTH_API_KEY;
const DASHBOARD_URL = process.env.DASHBOARD_URL;
const AUTH_URL = process.env.AUTH_URL;

// Tell me it's working!
app.listen(PORT, () => {
  console.log(`\nShhh... I'm listening on port ${PORT}.\n`);
});

// Custom Middleware - Route-Logging
const routeLogger = (req, res, next) => {
  console.log(`${new Date().toTimeString()} :: HIT ${req.path}`);
  next();
};
app.use(routeLogger);

// Middleware Parse request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(multer().array());

// // // Routes // // //

// Proposals
app.use("/proposals", require("./routes/proposals"));
// Proposal Statuses
app.use("/statuses", require("./routes/statuses"));
// Resources
app.use("/resources", require("./routes/resources"));
// PIs
app.use("/pis", require("./routes/pis"));
// TICs
app.use("/tics", require("./routes/tics"));
// Organizations
app.use("/organizations", require("./routes/organizations"));
// Therapeutic Area
app.use("/therapeutic-areas", require("./routes/therapeutic-areas"));
// Studies
app.use("/studies", require("./routes/studies"));
// Sites
app.use("/sites", require("./routes/sites"));
// CTSAs
app.use("/ctsas", require("./routes/ctsas"));
// CTSAs
app.use("/template", require("./routes/template-download"));

// Graphics
app.use("/graphics", require("./routes/graphics"));

app.get("/auth_status", (req, res, next) => {
  const authInfo =
    typeof req.session.auth_info === "undefined" ? {} : req.session.auth_info;
  res.status(200).send({ auth_info: authInfo });
});

// Auth
app.post("/auth", (req, res, next) => {
  const code = req.body.code;
  const agent = new https.Agent({
    rejectUnauthorized: false,
  });
  if (!req.session.auth_info) {
    axios
      .get(
        `${AUTH_URL}/v1/authorize?apikey=${AUTH_API_KEY}&provider=venderbilt&return_url=${DASHBOARD_URL}&code=${code}&redirect=False`,
        { httpsAgent: agent }
      )
      .then((response) => {
        if (response.status === 200) {
          const data = response.data;
          data.authenticated = true;
          req.session.auth_info = data;

          res.redirect(
            `${AUTH_URL}/v1/authorize?apikey=${AUTH_API_KEY}&provider=venderbilt&return_url=${DASHBOARD_URL}&code=${code}`
          );
          res.end();
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(400).send("error");
      });
  } else {
    res.redirect(
      `${AUTH_URL}/v1/authorize?apikey=${AUTH_API_KEY}&provider=venderbilt&return_url=${DASHBOARD_URL}&code=${code}`
    );
  }
});
