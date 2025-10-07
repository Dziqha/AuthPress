const jwt = require("../libs/jwt");
const basic = require("../libs/basic");
const apikey = require("../libs/apikey");
const oauth = require("../libs/oauth");

function applyAuth(app, routes) {
  routes.forEach((r) => {
    switch (r.type) {
      case "jwt":
        app[r.method](r.path, jwt(r.config), r.handler);
        break;
      case "basic":
        app[r.method](r.path, basic(r.config), r.handler);
        break;
      case "apikey":
        app[r.method](r.path, apikey(r.config), r.handler);
        break;
      case "oauth":
        if (r.config.callback) {
          app[r.method](r.path, oauth.callback(r.config.provider));
        } else {
          app[r.method](r.path, oauth.login(r.config.provider));
        }
        if (r.handler) app[r.method](r.path, r.handler);
        break;
      default:
        app[r.method](r.path, r.handler);
    }
  });
}

module.exports = applyAuth;
