var express, router;
express = require("express");
function noteRoutes(config) {
  const { notes, sharedSecret } = config;
  router = express.Router();
  router.use("/create", require("./note/create")({ notes, sharedSecret }));
  router.use("/list", require("./note/list")({ notes, sharedSecret }));
  return router;
}

module.exports = config => noteRoutes(config);
