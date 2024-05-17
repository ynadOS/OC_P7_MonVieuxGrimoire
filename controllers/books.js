const Book = require("../models/Book")
const fs = require("fs")

exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book)
    delete bookObject._id
    delete bookObject._userId
    const book = new Book({
      ...bookObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get("host")}/images/resized_${req.file.filename}`,
    })
    book
      .save()
      .then(() => {
        res.status(201).json({ message: "Livre enregistré avec succès !" })
      })
      .catch((error) => {
        res.status(400).json({ error })
      })
  }

exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/resized_${req.file.filename}`
    } : { ...req.body }
    delete bookObject._userId
    Book.findOne({_id: req.params.id})
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message : "Not authorized"})
            } else {
                Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})
                .then(() => res.status(200).json({message : "Livre modifié !"}))
                .catch(error => res.status(401).json({ error }))
            }
        })
        .catch((error) => {
            res.status(400).json({ error })
        })
}

exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id})
        .then(book => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({message: "Not authorized"})
            } else {
                const filename = book.imageUrl.split("/images/")[1]
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({_id: req.params.id})
                        .then(() => { res.status(200).json({message: "Livre supprimé !"})})
                        .catch(error => res.status(401).json({ error }))
                })
            }
        })
        .catch( error => {
            res.status(500).json({ error })
        })
 }

exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
    .then(thing => res.status(200).json(thing))
    .catch(error => res.status(404).json({ error }))
}

exports.getAllBooks = (req, res, next) => {
    Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }))
}

exports.getBestRating = (req, res, next) => {
    Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(500).json({ error }))
}

exports.createRating = async (req, res, next) => {
    try {
        const userId = req.auth.userId
        const rating = req.body.rating

        if (rating < 0 || rating > 5) {
            return res.status(400).json({ message: "La note doit être comprise entre 1 et 5." })
        }

        const book = await Book.findById(req.params.id)

        if (!book) {
            return res.status(404).json({ message: "Livre non trouvé." })
        }

        const alreadyRated = book.ratings.some(rate => rate.userId === userId)
        if (alreadyRated) {
            return res.status(400).json({ message: "Vous avez déjà noté ce livre." })
        }

        const totalRatings = book.ratings.length
        const newTotal = book.averageRating * totalRatings + rating
        const newAverageRating = (newTotal / (totalRatings + 1)).toFixed(2) // Formatage avec deux chiffres après la virgule

        book.ratings.push({ userId, grade: rating })
        book.averageRating = newAverageRating

        await book.save()
        return res.status(201).json(book)
      } catch (error) {
        return res
          .status(500)
          .json({ error: "Erreur lors de la création de la notation" })
      }
}