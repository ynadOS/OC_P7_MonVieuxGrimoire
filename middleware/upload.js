const multer = require("multer")
const sharp = require("sharp")

const path = require("path")
const fs = require("fs")

const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpeg",
  "image/png": "png"
}

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "images")
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(" ").join("_")
    const extension = MIME_TYPES[file.mimetype]
    callback(null, name + Date.now() + "." + ".webp")
  }
})

const fileFilter = (req, file, callback) => {
  if (MIME_TYPES[file.mimetype]) {
    callback(null, true)
  } else {
    callback(new Error("Fichier non autorisé. Seuls les fichiers JPG, JPEG et PNG sont autorisés."), false)
  }
}

module.exports = multer({storage: storage, fileFilter: fileFilter}).single("image")

// Redimensionnement avec Sharp //
module.exports.resizeImage = (req, res, next) => {
  // On vérifie si un fichier a été téléchargé
  if (!req.file) {
    return next()
  }

  const filePath = req.file.path
  const fileName = req.file.filename
  const outputFilePath = path.join("images", `resized_${fileName}`)

  sharp(filePath)
    .resize({ height: 500 })
    .toFile(outputFilePath)
    .then(() => {
      console.log(`Image ${fileName} optimisée en .webP !`)
        fs.unlink(filePath, () => {
        req.file.path = outputFilePath
        next()
      })
    })
    .catch(err => {
      console.log(err)
      return next()
    })
}