var router, express, debug;
express = require("express");
router = express.Router();
debug = require("debug")("security");

module.exports = config = function(config) {
  return router.delete("/", (req, res) => {
    const username = req.session.username;
    if (username) {
      debug("logout()", username);
      req.session.authenticated = false;
      delete req.session.username;
      return res.json({
        status: "success",
        message: username + " successfully logged out!"
      });
    }
    return res.json({
      status: "error",
      message: "User not logged in"
    });
  });
};
