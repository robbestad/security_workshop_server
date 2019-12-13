var hash, express, router, validPassword;

var express = require("express");
hash = require("../../../lib/security/hashing/hashing").hash;
validPassword = require("../../../lib/security/password/password_validation");
http = require("http");
var router = express.Router();

module.exports = config = function({ users, sharedSecret }) {
  return router.use("/", (req, res) => {
    const { username, password } = req.body;
    if (username.length < 2 || !validPassword(password)) {
      return res
        .status(500)
        .send({
          status: "error",
          message: "invalid username/password combination"
        });
    }
    const hashedResult = hash(password, null, sharedSecret);
    users.push({ username, salt: hashedResult[0], hash: hashedResult[1] });
    return res.json({ status: "success", message: username + " created" });
  });
};
