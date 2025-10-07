const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const DiscordStrategy = require("passport-discord").Strategy;
const jwt = require("jsonwebtoken");

const providersConfig = [];

/**
 * Setup providers
 * providerObj = { provider, clientId, clientSecret, callbackURL, mode, jwtSecret, jwtExpiresIn }
 * mode: "session" | "jwt"
 * jwtExpiresIn: string | number (contoh: "1h", "30m", 3600)
 */
function oauth(providers) {
  if (!Array.isArray(providers)) providers = [providers];

  providers.forEach((p) => {
    providersConfig.push(p); 

    const strategyCallback = (accessToken, refreshToken, profile, done) => {
      if (p.mode === "jwt") done(null, profile);
      else done(null, { provider: p.provider, ...profile });
    };

    switch (p.provider.toLowerCase()) {
      case "google":
        passport.use(
          new GoogleStrategy(
            {
              clientID: p.clientId,
              clientSecret: p.clientSecret,
              callbackURL: p.callbackURL,
            },
            strategyCallback
          )
        );
        break;
      case "github":
        passport.use(
          new GitHubStrategy(
            {
              clientID: p.clientId,
              clientSecret: p.clientSecret,
              callbackURL: p.callbackURL,
            },
            strategyCallback
          )
        );
        break;
      case "facebook":
        passport.use(
          new FacebookStrategy(
            {
              clientID: p.clientId,
              clientSecret: p.clientSecret,
              callbackURL: p.callbackURL,
              profileFields: ["id", "displayName", "emails"],
            },
            strategyCallback
          )
        );
        break;
      case "discord":
        passport.use(
          new DiscordStrategy(
            {
              clientID: p.clientId,
              clientSecret: p.clientSecret,
              callbackURL: p.callbackURL,
              scope: ["identify", "email"],
            },
            strategyCallback
          )
        );
        break;
      default:
        throw new Error(`Provider '${p.provider}' not supported`);
    }
  });

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));
}

function init(app) {
  app.use(passport.initialize());
  app.use(passport.session());
}

function login(providerName) {
  const config = providersConfig.find(
    (p) => p.provider.toLowerCase() === providerName.toLowerCase()
  );
  if (!config) throw new Error(`Provider '${providerName}' not configured`);
  return passport.authenticate(providerName, {
    session: config.mode === "session",
    scope: ["profile", "email"],
  });
}

function callback(providerName) {
  const config = providersConfig.find(
    (p) => p.provider.toLowerCase() === providerName.toLowerCase()
  );
  if (!config) throw new Error(`Provider '${providerName}' not configured`);

  if (config.mode === "session") {
    return passport.authenticate(providerName, {
      successRedirect: "/",
      failureRedirect: "/",
      session: true,
    });
  } else {
    return [
      passport.authenticate(providerName, { session: false }),
      (req, res) => {
        const token = jwt.sign(
          { id: req.user.id, name: req.user.displayName },
          config.jwtSecret || "secret",
          { expiresIn: config.jwtExpiresIn || "1h" }
        );
        res.json({
          message: "Login successful",
          token,
          expiresIn: config.jwtExpiresIn || "1h",
        });
      },
    ];
  }
}

module.exports = { oauth, init, login, callback, passport };
