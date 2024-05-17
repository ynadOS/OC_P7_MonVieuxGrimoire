const express = require("express")
const router = express.Router()

const auth = require("../middleware/auth")
const upload = require("../middleware/upload")

const bookCtrl = require("../controllers/books")

// CRUD

// [Create] POST, créer un nouveau livre/nouvelle notation
router.post("/", auth, upload, upload.resizeImage, bookCtrl.createBook)
router.post("/:id/rating", auth, bookCtrl.createRating)

// [Read] READ
router.get("/bestrating", bookCtrl.getBestRating)
router.get("/:id", bookCtrl.getOneBook)
router.get("/", bookCtrl.getAllBooks)

// [Update] PUT, modifier un livre
router.put("/:id", auth, upload, upload.resizeImage, bookCtrl.modifyBook)

// [Delete] DELETE, supprimer un livre
router.delete("/:id", auth, bookCtrl.deleteBook)

module.exports = router