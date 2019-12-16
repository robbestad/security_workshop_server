var express, router, encrypt, debug;

var express = require("express");
encrypt = require("../../../lib/security/encryption/encryption").encrypt;
decrypt = require("../../../lib/security/encryption/encryption").decrypt;
http = require("http");
debug = require("debug")("test");
var router = express.Router();

module.exports = config = function({ notes, sharedSecret }) {
  return router.post("/", (req, res) => {
    const { title, text } = req.body;
    const username = req.session.username;
    if (title.length < 2) {
      return res.status(500).send({
        status: "error",
        message: "invalid title"
      });
    }
    const id = (
      new Date().getTime().toString(36) +
      Math.random()
        .toString(36)
        .slice(2)
    ).slice(0, 18);
    var noteInsert = {
      id,
      username,
      title: encrypt(title),
      text: encrypt(text)
    };
    notes.push(noteInsert);
    return res.json({ status: "success", message: title + " created", id });
  });
};
