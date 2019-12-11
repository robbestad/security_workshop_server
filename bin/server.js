"use strict";
var bodyParser, express, app, server, sharedSecret, session, port;

sharedSecret =
  process.env.sharedSecret ||
  (console.log("Abort... provide sharedSecret"), process.exit());

express = require("express");
bodyParser = require("body-parser");
session = require("express-session");

var users = [];

// setup server
app = express();
app.use(bodyParser.json());

// set up the session
app.use(session(require("./session_config")({ app, sharedSecret })));

// setup routes
app.use("/api/v1", require("./routes/info"));
app.use("/api/v1/session", require("./routes/session"));
app.use("/api/v1/user", require("./routes/user")({ users, sharedSecret }));

port = app.get("port") || 1337;

server = app.listen(port, () =>
  console.log(`Sven Anders sitt API listening on port ${port}!`)
);

function stop() {
  server.close();
}

module.exports = app; // for starting server in test runner
module.exports.stop = stop; // for stopping server in test runner
