const router = require('express').Router()
exports.router = router
const bcrypt = require('bcryptjs')
const {Business} = require("../models/business")
const {Photo} = require('../models/photo')
const {Review} = require('../models/review')
const {User, getUserByEmail, getUserById, validateCredentials} = require('../models/user')
const{ generateAuthToken, requireAuthentication, checkAdmin} = require('../lib/auth')

/*
 * Route to list all of a user's businesses.
 */
router.get('/:userId/businesses', requireAuthentication, async function (req, res) {
  const userId = parseInt(req.params.userId)
  if (req.user !== userId && !req.isAdmin) {
    res.status(403).send({
      error: "Not authorized to access the specified resource"
    })
  } else {
    try {
      const userBusinesses = await Business.findAll({
        where:{
          ownerId: userId
        }
      })
      res.status(200).send({
        businesses: userBusinesses
      })
    } catch (e) {
      next(e)
    }
  }
})

/*
 * Route to list all of a user's reviews.
 */
router.get('/:userId/reviews', requireAuthentication, async function (req, res) {
  const userId = parseInt(req.params.userId)
  if (req.user !== userId && !req.isAdmin) {
    res.status(403).send({
      error: "Not authorized to access the specified resource"
    })
  }else{
    try{
      const userReviews = await Review.findAll({
        where: {
          userId: userId
        }
      })
      res.status(200).send({
        reviews: userReviews
      })
    }catch(e){
      next(e)
    }
  }
})

/*
 * Route to list all of a user's photos.
 */
router.get('/:userId/photos', requireAuthentication, async function (req, res) {
  const userId = parseInt(req.params.userId)
  if (req.user !== userId && !req.isAdmin) {
    res.status(403).send({
      error: "Not authorized to access the specified resource"
    })
  }else{
    try{
      const userPhotos = await Photo.findAll({
        where: {
          userId: userId
        }
      })
      res.status(200).send({
        photos: userPhotos
      })
    }catch(e){
      next(e)
    }
  }
  
})

/*
 * Route to create a new user
 */
router.post('/', checkAdmin, async function (req, res, next){
  const user = req.body
  const hash = await bcrypt.hash(user.password, 8)
  const userData = {
    name: user.name,
    email: user.email,
    password: hash
  }
  if (req.isAdmin){
    userData.admin  = user.admin
  }
  if ( await getUserByEmail(userData.email)){
    res.status(409).send("User already exit!")
  }else{
    try{
      const user = await User.create(userData)
      res.status(201).send({id:user.id})
    }catch(e){
      next(e)
    }
  }
})

router.post('/login', async function(req, res, next) {
  const user = req.body
  try{
    const authenticated_user = await validateCredentials(user.email, user.password)
    if (authenticated_user){
      const token = generateAuthToken(authenticated_user)
      res.status(200).send({token:token})
    }else{
      res.status(401).send({
        error: "Invalid authentication credentials"
    })
    }
  }catch(e){
    next(e)
  }
  
})

router.get('/:id', requireAuthentication, async function (req, res, next) {
  const userId = parseInt(req.params.id)
  if (req.user !== userId && !req.isAdmin) {
    res.status(403).send({
      error: "Not authorized to access the specified resource"
    })
  } else {
      try {
          const user = await getUserById(userId)
          if (user) {
              res.status(200).send(user)
          } else {
              next()
          }
      } catch (e) {
          next(e)
      }
  }
})