const router = require('express').Router()
const { validateAgainstSchema, extractValidFields } = require('../lib/validation')
const { ValidationError } = require('sequelize')
const {Photo, PhotoClientFields} = require('../models/photo')
const{requireAuthentication} = require('../lib/auth')

exports.router = router

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
router.post('/', requireAuthentication, async function (req, res, next) {
  const photo = req.body
  const userId = photo.userId
  if (req.user !== userId && !req.isAdmin) {
    res.status(403).send({
      error: "Not authorized to access the specified resource"
    })
  }else{
    try{
      const photo = await Photo.create(req.body, PhotoClientFields)
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
router.put('/:photoID', requireAuthentication, async function (req, res, next) {
  const photoID = parseInt(req.params.photoID)
  const userId = parseInt(req.body.userId)
  const updatedData = {
    userId: req.body.userId,
    businessId: req.body.businessId,
    caption: req.body.caption
  }
  try{
    const existingPhoto = await Photo.findByPk(photoID)
    if (existingPhoto){
      if ((req.user !== userId || req.user !== existingPhoto.userId) && !req.isAdmin) {
        res.status(403).send({
          error: "Not authorized to access the specified resource"
        })
      }else if(existingPhoto.businessId !== updatedData.businessId && !req.isAdmin){
        res.status(403).send({
          error: "Updated photo cannot modify businessid or userid"
        })
      }else{
        const updatedPhoto = await Photo.update(updatedData, {
          where:{
            id: photoID
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
 * Route to delete a photo.
 */
router.delete('/:photoID', requireAuthentication, async function (req, res, next) {
  const photoID = parseInt(req.params.photoID)
  if (isNaN(photoID)) {
    next()
  } 
  try{
    const photo = await Photo.findByPk(photoID)
    if (photo){
      if (req.user !== photo.userId && !req.isAdmin) {
        res.status(403).send({
          error: "Not authorized to access the specified resource"
        });
      }else{
        await Photo.destroy({
          where: {
            id: photoID
          }
        });
        res.status(204).send();
      }
    }else{
      next();
    }
  }catch(e){
    next(e);
  }
})
