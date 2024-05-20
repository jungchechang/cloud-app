const jwt = require("jsonwebtoken")

const secretKey = "SuperSecret"

exports.generateAuthToken = function (user) {
    const payload = {
      sub: user.id,
      isAdmin: user.admin
    }
    return jwt.sign(payload, secretKey, { expiresIn: "24h" })
}

exports.requireAuthentication = function (req, res, next) {
    const authHeader = req.get("Authorization") || ""
    const authHeaderParts = authHeader.split(" ")
    const token = authHeaderParts[0] === "Bearer" ? authHeaderParts[1] : null
    try {
      const payload = jwt.verify(token, secretKey)
      req.user = payload.sub
      req.isAdmin = payload.isAdmin
      next()
    } catch (e) {
      res.status(401).send({
        error: "Valid authentication token required"
      })
    }
}

exports.checkAdmin = function(req, res, next) {
    const authHeader = req.get("Authorization") || ""
    const authHeaderParts = authHeader.split(" ")
    const token = authHeaderParts[0] === "Bearer" ? authHeaderParts[1] : null
    if (token){
        const payload = jwt.verify(token, secretKey)
        req.user = payload.sub
        req.isAdmin = payload.isAdmin 
    }
    next()
    
}