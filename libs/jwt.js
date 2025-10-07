const jwtlib = require('jsonwebtoken');

function jwt(config){
    return (req, res, next) => {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) return res.status(401).json({ error: "No token provided" });
        try {
            const decoded = jwtlib.verify(token, config.secret);
            req.user = decoded;
            next();
        }catch (error) {
            res.status(401).json({ error: "Invalid token" });
        }
    }
}


jwt.withRole = function(roles = []) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: "Access denied" });
        }
        next();
    }
}


jwt.sign = (payload, secret, options) => jwtlib.sign(payload, secret, options);

jwt.refresh = (refreshToken, secret, options = {}) => {
    const payload = jwtlib.verify(refreshToken, secret);
    delete payload.iat;
    delete payload.exp;
    return jwt.sign(payload, secret, options);
}

module.exports = jwt;
