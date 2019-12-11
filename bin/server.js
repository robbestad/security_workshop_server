"use strict";
var name,
  bodyParser,
  express,
  port,
  app,
  server,
  sharedSecret,
  session,
  sessionConfig,
  debug;

sharedSecret =
  process.env.sharedSecret ||
  (console.log("Abort... provide sharedSecret"), process.exit());

name = "Sven Anders sitt API";

express = require("express");
bodyParser = require("body-parser");
session = require("express-session");
debug = require("debug")("server");

port = 1337;

var users = [];

// setup server
app = express();
app.use(bodyParser.json());

// set up the session
sessionConfig = {
  secret: sharedSecret,
  cookie: {},
  name: "sa-server",
  resave: true,
  saveUninitialized: true
};
if (app.get("env") === "production") {
  app.set("trust proxy", 1); // trust first proxy
  sessionConfig.cookie.secure = true; // serve secure cookies
}
app.use(session(sessionConfig));

// setup routes
app.use("/", require("./routes/home"));
app.use("/v1/session", require("./routes/session"));
app.use("/user/create", require("./routes/create")({ users, sharedSecret }));
app.use("/user/login", require("./routes/login")({ users }));
app.use("/user/login", require("./routes/logout")({ users }));

server = app.listen(port, () =>
  console.log(`${name} listening on port ${port}!`)
);

function stop() {
  server.close();
}

module.exports = app; // for starting server in test runner
module.exports.stop = stop; // for stopping server in test runner
