# 🛡️ AuthPress

![npm](https://img.shields.io/npm/v/authpress)
![npm downloads](https://img.shields.io/npm/dt/authpress)

Multi-auth middleware for **Express.js**: JWT, Basic, API Key, OAuth (Google, GitHub, Facebook, Discord).
Supports **session** or **JWT** mode for OAuth.

---

## Prerequisites

* Node.js >= 18
* Express.js >= 4
* `.env` file must include:

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK=http://localhost:3000/auth/google/callback
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_CALLBACK=http://localhost:3000/auth/github/callback
JWT_SECRET=yourjwtsecret
```

---

## Installation

```bash
npm install authpress
```

---

## Authentication Types

1. **JWT** – Stateless, best for SPA or API.
2. **Basic** – Simple username/password, good for internal tools.
3. **API Key** – Header-based authentication, ideal for service-to-service communication.
4. **OAuth** – Login via providers (Google, GitHub, Facebook, Discord), supports **session** or **JWT** mode.

---

## Usage

```js
const express = require("express");
const session = require("express-session");
const auth = require("authpress");
const applyAuth = auth.applyAuth;

const app = express();
app.use(express.json());
app.use(session({ secret: "secret", resave: false, saveUninitialized: true }));

// Initialize OAuth (only required for session mode)
auth.oauth.init(app);

// Setup providers
auth.oauth.oauth([
  {
    provider: "google",
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK,
    mode: "jwt",
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: "2h" // default "1h"
  },
  {
    provider: "github",
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK,
    mode: "session"
  }
]);

// JWT route
app.get("/jwt", auth.jwt({ secret: process.env.JWT_SECRET }), (req, res) => {
  res.json({ message: "JWT Auth OK", user: req.user });
});

// JWT Login (generate token)
app.post('/login', (req, res) => {
  const user = { id: 1, username: 'admin', role: 'admin' };
  const token = auth.jwt.sign(user, config.secret, { expiresIn: '1h' });
  res.json({ token });
});

// JWT route with role
app.get('/admin', auth.jwt({ secret: process.env.JWT_SECRET }), auth.jwt.withRole(['admin']), (req, res) => {
  res.json({ message: 'Admin Dashboard' });
});

// JWT Refresh token
app.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;
  try {
    const newToken = auth.jwt.refresh(refreshToken, config.secret, { expiresIn: '1h' });
    res.json({ token: newToken });
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// Basic Auth route
app.get("/basic", auth.basic({ users: { admin: "1234" } }), (req, res) => {
  res.json({ message: "Basic Auth OK", user: req.user });
});

// API Key route
app.get("/apikey", auth.apikey({ keyHeader: "x-api-key", keys: ["123456"] }), (req, res) => {
  res.json({ message: "API Key OK" });
});

// OAuth routes
app.get("/auth/google", auth.oauth.login("google"));
app.get("/auth/google/callback", auth.oauth.callback("google"));

// Multi-auth setup (optional)
const routes = [
  { method: "get", path: "/jwt", type: "jwt", config: { secret: process.env.JWT_SECRET }, handler: (req,res)=>res.json({user:req.user}) },
  { method: "get", path: "/basic", type: "basic", config: { users: { admin: "1234" } }, handler: (req,res)=>res.json({user:req.user}) },
  { method: "get", path: "/apikey", type: "apikey", config: { keyHeader: "x-api-key", keys: ["123456"] }, handler: (req,res)=>res.json({message:"API Key OK"}) },
  { method: "get", path: "/auth/google", type: "oauth", config: { provider: "google" }, handler: (req,res)=>{} },
  { method: "get", path: "/auth/google/callback", type: "oauth", config: { provider: "google", successRedirect: "/", failureRedirect: "/" }, handler: (req,res)=>{} }
];

applyAuth(app, routes);

app.listen(3000, () => console.log("✅ Server running at http://localhost:3000"));
```

---

## Tips

* Use `mode: "jwt"` for SPAs or mobile apps.
* Use `mode: "session"` for traditional web applications.
* Supports multiple OAuth providers at once.
* JWT can be customized via `jwtExpiresIn` and `jwtSecret`.
* All authentication routes can be managed from a single `routes` array → clean & scalable.

---

## License

🛡️ AuthPress is released under the [MIT License](./LICENSE).