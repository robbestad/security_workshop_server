function sessionConfig({ sharedSecret, app }) {
  var _sessionConfig = {
    secret: sharedSecret,
    cookie: {},
    name: "sa-server",
    resave: true,
    saveUninitialized: true
  };
  if (app.get("env") === "production") {
    app.set("trust proxy", 1); // trust first proxy
    _sessionConfig.cookie.secure = true; // serve secure cookies
  }
  return _sessionConfig;
}

module.exports = params => sessionConfig(params);
