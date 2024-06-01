const multer = require("multer")
const crypto = require("node:crypto")


const imageTypes = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif"
}
const upload = multer({
    storage: multer.diskStorage({
        destination: `${__dirname}/../uploads/original`,
        filename: (req, file, callback) => {
            const filename = crypto.pseudoRandomBytes(16).toString("hex")
            const extension = imageTypes[file.mimetype]
            callback(null, `${filename}.${extension}`)
        },
        fileFilter: (req, file, callback) => {
            callback(null, !!imageTypes[file.mimetype])
        }
    }),
})

exports.upload = upload