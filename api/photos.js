const router = require('express').Router()
const { validateAgainstSchema, extractValidFields } = require('../lib/validation')
const { ValidationError } = require("sequelize")
const photos = require('../data/photos')
const Photo = require('../models/photo')

exports.router = router
exports.photos = photos

/*
 * Schema describing required/optional fields of a photo object.
 */
const photoSchema = {
  userid: { required: true },
  businessid: { required: true },
  caption: { required: false }
}


/*
 * Route to create a new photo.
 */
router.post('/', async function (req, res, next) {
  try{
    const photo = await Photo.create(req.body, [
      "userId",
      "businessId",
      "caption"
    ])
    console.log("  -- photo:", photo.toJSON())
    res.status(201).send({
        id: photo.id
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
 * Route to fetch info about a specific photo.
 */
router.get('/:photoID', async function (req, res, next) {
  const photoID = parseInt(req.params.photoID)
  const photo = await Photo.findByPk(photoID)
  if (photo) {
    res.status(200).send(photo)
  } else {
    next()
  }
})

/*
 * Route to update a photo.
 */
router.put('/:photoID', async function (req, res, next) {
  const photoID = parseInt(req.params.photoID)
  const updatedData = {
    userId: req.body.userId,
    businessId: req.body.businessId,
    caption: req.body.caption
  }
  const photo = await Photo.findByPk(photoID)
  
  if (photo){
    if (photo.businessId === updatedData.businessId && photo.userId === updatedData.userId ) {
      try{
        await Photo.update(updatedData, {
          where:{
            id: photoID
          }
        })
        res.status(200).send({
          links: {
            photo: `/photos/${photoID}`,
            business: `/businesses/${updatedData.businessId}`
          }
        })
      }catch(e){
        next(e)
      }
    }else{
      res.status(403).send({
        error: "Updated photo cannot modify businessid or userid"
      })
    }
  }else{
    next()
  }
})

/*
 * Route to delete a photo.
 */
router.delete('/:photoID', async function (req, res, next) {
  const photoID = parseInt(req.params.photoID)
  const photo = await Photo.findByPk(photoID)
  if (photo) {
    try{
      await Photo.destroy({
        where: {
          id: photoID
        }
      })
      res.sendStatus(204)
    }catch(e){
      next(e)
    }
  }else{
    next()
  }
})
