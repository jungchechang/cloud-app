const router = require('express').Router()
const { validateAgainstSchema, extractValidFields } = require('../lib/validation')
const { ValidationError } = require('sequelize')
const {Photo, PhotoClientFields, createNewPhoto, getPhotoById, updatePhotoById, deletePhotoById} = require('../models/photo')
const{requireAuthentication} = require('../lib/auth')
const {upload} = require('../lib/multer')
const { connectToRabbitMQ, getChannel, queueName } = require('../lib/rabbitmq')

exports.router = router

/*
 * Route to create a new photo.
 */
router.post('/', requireAuthentication, upload.single("image"), async function (req, res, next) {
  const photo_data = {
    ...req.body,
    filename:req.file.filename,
    path: req.file.path,
    contentType: req.file.mimetype
  }
  const userId = parseInt(photo_data.userId)
  if (req.user !== userId && !req.isAdmin) {
    res.status(403).send({
      error: "Not authorized to access the specified resource"
    })
  }else{
    try{
      const photo = await createNewPhoto(photo_data)
      /*
         * Generate offline work
         */
      const channel = getChannel()
      channel.sendToQueue(queueName, Buffer.from(photo.id.toString()))

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
  const photo = await getPhotoById(photoID)
  
  if (photo) {
    res.status(200).send({
      photo:photo,
      url: `/media/photos/${photo.filename}`
    })
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
    const existingPhoto = await getPhotoById(photoID)
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
        const updatedPhoto = await updatePhotoById(photoID, updatedData)
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
    const photo = await getPhotoById(photoID)
    if (photo){
      if (req.user !== photo.userId && !req.isAdmin) {
        res.status(403).send({
          error: "Not authorized to access the specified resource"
        });
      }else{
        const result = await deletePhotoById(photoID)
        if (result) {
          res.status(204).send();
        }else{
          res.status(400).send({
            error: "Unable to delete photo"
          });
        }
      }
    }else{
      next();
    }
  }catch(e){
    next(e);
  }
})
