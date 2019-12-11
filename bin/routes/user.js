var express, router, isAuthenticated;
express = require("express");
function userRoutes(config) {
  const { users, sharedSecret } = config;
  router = express.Router();
  router.use("/create", require("./user/create")({ users, sharedSecret }));
  router.use("/login", require("./user/login")({ users }));
  router.use("/login", require("./user/logout")({ users }));
  return router;
}

module.exports = config => userRoutes(config);
