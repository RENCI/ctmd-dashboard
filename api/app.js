const express = require("express");
const app = express();
const cors = require("cors");
const db = require("./config/database");
var multer = require("multer");
const axios = require("axios");
const session = require("express-session");

// CORS
app.use(cors());

// session
app.use(
  session({
    secret: process.env.API_SESSION_SECRET,
    cookie: {
      maxAge: 360000,
    },
  })
);

app.use((req, res, next) => {
  if (req.path === "/auth" || process.env.NODE_ENV === "development") {
    next();
  } else {
    if (req.app.get("authenticated")) {
      next();
    } else {
      res.status(401).send("Please login");
    }
  }
});

// Config
const PORT = process.env.API_PORT || 3030;
const AUTH_API_KEY = process.env.FUSE_AUTH_API_KEY;
const DASHBOARD_URL = process.env.DASHBOARD_URL;

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

// Auth
app.post("/auth", (req, res, next) => {
  const code = req.body.code;
  // process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
  if (!app.get("authenticated")) {
    console.log("going in here");
    axios
      .get(
        `http://dev-auth-fuse.renci.org/v1/authorize?apikey=${AUTH_API_KEY}&provider=venderbilt&return_url=${DASHBOARD_URL}&code=${code}&redirect=False`
      )
      .then((response) => {
        if (response.status === 200) {
          app.set("authenticated", true);
          res.redirect(
            `https://dev-auth-fuse.renci.org/v1/authorize?apikey=${AUTH_API_KEY}&provider=venderbilt&return_url=${DASHBOARD_URL}&code=${code}`
          );
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(400).send("error");
      });
  } else {
    res.redirect(
      `https://dev-auth-fuse.renci.org/v1/authorize?apikey=${AUTH_API_KEY}&provider=venderbilt&return_url=${DASHBOARD_URL}&code=${code}`
    );
  }
});
