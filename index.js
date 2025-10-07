const jwt = require("./libs/jwt");
const basic = require("./libs/basic");
const apikey = require("./libs/apikey");
const oauth2 = require("./libs/oauth");
const applyAuth = require("./middleware/authRoutes");

module.exports = {
  jwt,
  basic,
  apikey,
  oauth2,
  applyAuth,
};