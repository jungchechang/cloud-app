const express = require('express')
const router = express.Router()

exports.router = router

router.use("/photos",  express.static(`${__dirname}/../uploads/original`))

router.use("/thumbs",  express.static(`${__dirname}/../uploads/thumb`))

