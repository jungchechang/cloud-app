const express = require('express')
const morgan = require('morgan')
const sequelize = require("./sequelize")
const Business = require("./models/business")
const Photo = require('./models/photo')
const Review = require('./models/review')
const businesses = require('./data/businesses.json')
const reviews = require('./data/reviews.json')
const photos = require('./data/photos.json')
const api = require('./api')

const app = express()
const port = process.env.PORT || 8000
/*
 * Morgan is a popular request logger.
 */
app.use(morgan('dev'))

app.use(express.json())
app.use(express.static('public'))

//initializeDatabase
async function initializeDatabase() {
  try {
      await sequelize.authenticate();
      console.log('Connection has been established successfully.');

      // Force true will drop the table if it already exists
      await sequelize.sync({ force: true });
      console.log('Tables has been successfully created.');
      await Business.bulkCreate(businesses);
      console.log('Business data has been successfully created.');
      await Review.bulkCreate(reviews);
      console.log('Review data has been successfully created.');
      await Photo.bulkCreate(photos);
      console.log('Photo data has been successfully created.');

  } catch (error) {
      console.error('Error during the initialization of the database:', error);
  }
}

initializeDatabase();

app.use('/', api)

app.use('*', function (req, res, next) {
  res.status(404).send({
    error: `Requested resource "${req.originalUrl}" does not exist`
  })
})

/*
 * This route will catch any errors thrown from our API endpoints and return
 * a response with a 500 status to the client.
 */
app.use('*', function (err, req, res, next) {
  console.error("== Error:", err)
  res.status(500).send({
      error: "Server error.  Please try again later."
  })
})

app.listen(port, function() {
  console.log("== Server is running on port", port)
})

// sequelize.sync().then(function () {
//     app.listen(port, function () {
//         console.log("== Server is listening on port:", port)
//     })
// })
