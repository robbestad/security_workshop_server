"use strict";
var bodyParser, express, port, app, server, sharedSecret;

sharedSecret =
  process.env.sharedSecret ||
  (console.log("Abort... provide sharedSecret"), process.exit());

express = require("express");
bodyParser = require("body-parser");
port = 1337;

app = express();
app.use(bodyParser.json());

var users = [];

app.use("/", require("./routes/home"));
app.use("/user/create", require("./routes/create")({ users, sharedSecret }));
app.use("/user/login", require("./routes/login")(users));

server = app.listen(port, () =>
  console.log(`Example app listening on port ${port}!`)
);

function stop() {
  server.close();
}

module.exports = app; // for starting server in test runner
module.exports.stop = stop; // for stopping server in test runner
