const basicAuth = require("basic-auth");

function basic(config = {}) {
  const users = config.users || {};

  return (req, res, next) => {
    const user = basicAuth(req);

    if (!user) {
      res.set("WWW-Authenticate", 'Basic realm="Autho Protected"');
      return res
        .status(401)
        .json({ error: "Missing Basic Authorization header" });
    }

    const isValid = users[user.name] && users[user.name] === user.pass;

    if (!isValid) {
      res.set("WWW-Authenticate", 'Basic realm="Autho Protected"');
      return res.status(401).json({ error: "Invalid username or password" });
    }

    req.user = { username: user.name };
    next();
  };
}

module.exports = basic;