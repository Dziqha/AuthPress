function apikey(config){
    return async(req, res, next) => {
        const key = req.headers[config.keyHeader.toLowerCase()];
        let valid = config.keys?.includes(key);

        if(config.checkInDB) {
            valid = valid || await config.checkInDB(key);
        }

        if(!valid) {
            return res.status(401).json({ error: "Invalid API key" });
        }
        next();
    }
}

module.exports = apikey;