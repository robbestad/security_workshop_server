var verify, router, express, debug;
express = require("express");
verify = require("../../lib/security/hashing/hashing").verify;
router = express.Router();
debug = require("debug")("security");

module.exports = config = function(config) {
  const { users } = config;
  return router.post("/", (req, res) => {
    const { username, password } = req.body;
    const user = users.find(item => {
      return item.username === username;
    });
    const valid = verify(password, user.salt, user.hash);
    debug("login()", { valid });

    if (valid) {
      debug("login()", username, password);
      req.session.authenticated = true;
      req.session.username = username;
      return res.json({
        status: "success",
        message: username + " successfully logged in!"
      });
    }

    return res.json({
      status: "error",
      message: "User " + username + " could not log in"
    });
  });
};
