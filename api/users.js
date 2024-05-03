const router = require('express').Router()

exports.router = router

const { businesses } = require('./businesses')
const { reviews } = require('./reviews')
const { photos } = require('./photos')
const Business = require("../models/business")
const Photo = require('../models/photo')
const Review = require('../models/review')

/*
 * Route to list all of a user's businesses.
 */
router.get('/:userId/businesses',async function (req, res) {
  const userId = parseInt(req.params.userId)
  const userBusinesses = await Business.findAll({
    where:{
      ownerId: userId
    }
  })
  res.status(200).send({
    businesses: userBusinesses
  })
})

/*
 * Route to list all of a user's reviews.
 */
router.get('/:userId/reviews', async function (req, res) {
  const userId = parseInt(req.params.userId)
  const userReviews = await Review.findAll({
    where: {
      userId: userId
    }
  })
  res.status(200).send({
    reviews: userReviews
  })
})

/*
 * Route to list all of a user's photos.
 */
router.get('/:userId/photos', async function (req, res) {
  const userId = parseInt(req.params.userId)
  const userPhotos = await Photo.findAll({
    where: {
      userId: userId
    }
  })
  res.status(200).send({
    photos: userPhotos
  })
})
