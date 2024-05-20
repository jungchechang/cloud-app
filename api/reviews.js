const router = require('express').Router()
const { validateAgainstSchema, extractValidFields } = require('../lib/validation')
const { ValidationError } = require('sequelize')
const {Review, ReviewClientFields} = require ('../models/review')
const{requireAuthentication} = require('../lib/auth')

exports.router = router

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
router.post('/', requireAuthentication, async function (req, res, next) {
  const userId = parseInt(req.body.userId)
  if (req.user !== userId && !req.isAdmin) {
    res.status(403).send({
      error: "Not authorized to access the specified resource"
    })
  }else{
    try{
      const review = await Review.create(req.body, ReviewClientFields)
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
router.put('/:reviewID', requireAuthentication, async function (req, res, next) {
  const reviewID = parseInt(req.params.reviewID)
  // to do:validation
  const updatedData = {
    userId: req.body.userId,
    businessId: req.body.businessId,
    dollars: req.body.dollars,
    stars: req.body.stars,
    review: req.body.review
  }
  if (isNaN(reviewID)) {
    next()
  } 
  try{
    const existingReview = await Review.findByPk(reviewID)
    if (existingReview){
      if ((req.user !== req.body.userId || req.user !== existingReview.userId) && !req.isAdmin) {
        res.status(403).send({
          error: "Not authorized to access the specified resource"
        });
      }else if(existingReview.businessId !== updatedData.businessId && !req.isAdmin) {
        res.status(403).send({
          error: "Updated review cannot modify businessid or userid"
        })
      }else{
        await Review.update(updatedData, {
          where: {
            id: reviewID
          }
        })
        res.status(204).send()
      }
    }else{
      next()
    }
  }catch(e){
    next(e)
  }
})

/*
 * Route to delete a review.
 */
router.delete('/:reviewID', requireAuthentication, async function (req, res, next) {
  const reviewID = parseInt(req.params.reviewID)
  if (isNaN(reviewID)) {
    next()
  }
  try{
    const existingReview = await Review.findByPk(reviewID)
    if (existingReview){
      if (req.user !== existingReview.userId && !req.isAdmin) {
        res.status(403).send({
          error: "Not authorized to access the specified resource"
        })
      }else{
        await Review.destroy({
          where: {
            id: reviewID
          }
        })
        res.sendStatus(204)
      }
    }else{
      next()
    }
  }catch(e){
    next(e)
  }
})
