var express, router, debug;
express = require("express");
debug = require("debug")("security");
router = express.Router();
router.get("/", function(req, res, next) {
  debug("is logged in?", req.session.loggedIn);
  res.json({
    status: "success",
    message: "Velkommen til Sven Anders sitt API"
  });
});
module.exports = router;
