module.exports = function logger (req, res, next) {
    console.log("== Request recived")
    console.log(" -- METHOD:", req.method)
    console.log(" -- URL:", res.url)
    console.log(" -- HEADERS:", req.headers)
    next()
};