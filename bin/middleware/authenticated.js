function authenticated(req, res, next) {
  if (!req.session.authenticated) {
    return res.status(401).send({ message: "Unauthorized!" });
  }
  next();
}

module.exports = authenticated;
