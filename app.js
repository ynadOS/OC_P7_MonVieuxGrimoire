const express = require("express")
const mongoose = require("mongoose")
const path = require("path")

const app = express()

const booksRoutes = require("./routes/books")
const userRoutes = require("./routes/user")

// Connexion à MongoDB
mongoose.connect("mongodb+srv://champloo63:VIgT5DQpFtXiNZ9i@cluster0.m7cs0z6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"))

// CORS
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization")
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS")
    next()
  })

// Routes
app.use(express.json())
app.use("/api/books", booksRoutes)
app.use("/api/auth", userRoutes)
app.use("/images", express.static(path.join(__dirname, "images")))

module.exports = app