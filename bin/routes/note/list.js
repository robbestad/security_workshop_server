var express, router, decrypt, debug;

express = require("express");
decrypt = require("../../../lib/security/encryption/encryption").decrypt;
router = express.Router();
debug = require("debug")("test");

module.exports = config = function({ notes, sharedSecret }) {
  return router.get("/", (req, res) => {
    const { username } = req.session;
    const out = notes
      .filter(note => note.username === username)
      .map(note => {
        return {
          id: note.id,
          title: decrypt(note.title),
          text: decrypt(note.text)
        };
      });
    res.status(200).send({ notes: out });
  });
};
