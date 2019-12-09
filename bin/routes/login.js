var verify, router, express;
express = require("express");
verify = require("../../lib/security/hashing/hashing").verify;
router = express.Router();

module.exports = users = function(users) {
  return router.post("/", (req, res) => {
    const { username, password } = req.body;
    const user = users.find(item => {
      return item.username === username;
    });
    const valid = verify(password, user.salt, user.hash);

    if (valid) {
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
