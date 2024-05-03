const router = require('express').Router()
const { validateAgainstSchema, extractValidFields } = require('../lib/validation')
const { ValidationError } = require("sequelize")
const reviews = require('../data/reviews')
const Review = require ('../models/review')

exports.router = router
exports.reviews = reviews

/*
 * Schema describing required/optional fields of a review object.
 */
const reviewSchema = {
  userid: { required: true },
  businessid: { required: true },
  dollars: { required: true },
  stars: { required: true },
  review: { required: false }
}


/*
 * Route to create a new review.
 */
router.post('/', async function (req, res, next) {
  try{
    const review = await Review.create(req.body, [
      "userId",
      "businessId",
      "dollars",
      "stars",
      "review"
    ])
    console.log("  -- review:", review.toJSON())
    res.status(201).send({
        id: review.id
    })
  }catch(e){
    if (e instanceof ValidationError) {
      res.status(404).send({
        err: e.message
      })
    }else{
      next(e)
    }
  }
})

/*
 * Route to fetch info about a specific review.
 */
router.get('/:reviewID', async function (req, res, next) {
  const reviewID = parseInt(req.params.reviewID)
  const review = await Review.findByPk(reviewID)
  if (review) {
    res.status(200).send(review)
  }else{
    next()
  }
})

/*
 * Route to update a review.
 */
router.put('/:reviewID', async function (req, res, next) {
  const reviewID = parseInt(req.params.reviewID)
  const updatedData = {
    userId: req.body.userId,
    businessId: req.body.businessId,
    dollars: req.body.dollars,
    stars: req.body.stars,
    review: req.body.review
  }
  const review = await Review.findByPk(reviewID)
  
  if (review) {
    if (review.userId === updatedData.userId && review.businessId === updatedData.businessId){
      try{
        await Review.update(updatedData, {
          where: {
            id: reviewID
          }
        })
        res.status(200).send({
          links: {
            review: `/reviews/${reviewID}`,
            business: `/businesses/${updatedData.businessId}`
          }
        })
      }catch(e){
        next(e)
      }
    }else{
      res.status(403).send({
        error: "Updated review cannot modify businessid or userid"
      })
    }
  }else{
    next()
  }
})

/*
 * Route to delete a review.
 */
router.delete('/:reviewID', async function (req, res, next) {
  const reviewID = parseInt(req.params.reviewID)
  const review = await Review.findByPk(reviewID)
  if (review) {
    try{
      await Review.destroy({
        where: {
          id: reviewID
        }
      })
      res.sendStatus(204)
    }catch(e){
      next(e)
    }
  }else{
    next(e)
  }
})
