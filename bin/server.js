"use strict";
var bodyParser, express, app, server, session, port;
var sharedSecret, isAuthenticated;

sharedSecret =
  process.env.sharedSecret ||
  (console.log("Abort... provide sharedSecret"), process.exit());

express = require("express");
bodyParser = require("body-parser");
session = require("express-session");

isAuthenticated = require("./middleware/authenticated");
var users = [],
  notes = [];

// setup server
app = express();
app.use(bodyParser.json());

app.use(
  express.static(require("path").join(__dirname, "..", "client", "public"))
);

// set up the session
app.use(session(require("./session_config")({ app, sharedSecret })));

// setup routes
var debug = require("debug")("req");
app.use("*", (req, res, next) => {
  debug({ url: req.url });
  debug({ query: req.query });
  debug({ path: req.path });
  debug({ params: req.params });
  next();
});
app.use("/api/v1", require("./routes/info"));
app.use("/api/v1/session", require("./routes/session"));
app.use("/api/v1/user", require("./routes/user")({ users, sharedSecret }));
app.use("/api/v1/note", require("./routes/note")({ notes, sharedSecret }));
app.use("/*", (_, res) =>
  res.sendFile("index.html", { root: "client/public" })
);
port = process.env.PORT || 1337;

server = app.listen(port, () =>
  debug(`Sven Anders sitt API listening on port ${port}!`)
);

function stop() {
  server.close();
}

module.exports = app; // for starting server in test runner
module.exports.stop = stop; // for stopping server in test runner
