var hash, express, router;

var express = require("express");
hash = require("../../../lib/security/hashing/hashing").hash;
http = require("http");
var router = express.Router();

module.exports = config = function({ users, sharedSecret }) {
  return router.use("/", (req, res) => {
    const { username, password } = req.body;
    const hashedResult = hash(password, null, sharedSecret);
    users.push({ username, salt: hashedResult[0], hash: hashedResult[1] });
    return res.json({ status: "success", message: username + " created" });
  });
};
