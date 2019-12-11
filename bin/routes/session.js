var express, router, isAuthenticated;
express = require("express");
router = express.Router();
isAuthenticated = require("../middleware/authenticated");
router.get("/", isAuthenticated, (req, res) => {
  res.send({ username: req.session.username });
});
module.exports = router;
