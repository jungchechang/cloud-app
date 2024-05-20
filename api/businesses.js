const router = require('express').Router()
const { validateAgainstSchema, extractValidFields } = require('../lib/validation')
const { ValidationError } = require('sequelize')
const businesses = require('../data/businesses')
const {Business, BusinessClientFields} = require("../models/business")
const {Photo} = require('../models/photo')
const {Review} = require('../models/review')
const{requireAuthentication} = require('../lib/auth')

exports.router = router
exports.businesses = businesses

/*
 * Schema describing required/optional fields of a business object.
 */
const businessSchema = {
  ownerid: { required: true },
  name: { required: true },
  address: { required: true },
  city: { required: true },
  state: { required: true },
  zip: { required: true },
  phone: { required: true },
  category: { required: true },
  subcategory: { required: true },
  website: { required: false },
  email: { required: false }
}

/*
 * Route to return a list of businesses.
 */
router.get('/', async function (req, res) {

  let page = parseInt(req.query.page) || 1
  const numPerPage = 10
  page = page < 1 ? 1 : page
  const offset = (page - 1) * numPerPage

  const result = await Business.findAndCountAll({
    limit: numPerPage,
    offset: offset
  })
  const totalCount = result.count
  const lastPage = Math.ceil(totalCount / numPerPage)
  /*
   * Generate HATEOAS links for surrounding pages.
   */
  const links = {}
  if (page < lastPage) {
    links.nextPage = `/businesses?page=${page + 1}`
    links.lastPage = `/businesses?page=${lastPage}`
  }
  if (page > 1) {
    links.prevPage = `/businesses?page=${page - 1}`
    links.firstPage = '/businesses?page=1'
  }

  /*
   * Construct and send response.
   */
  res.status(200).send({
    businesses: result.rows,
    pageNumber: page,
    pageSize: numPerPage,
    totalCount: result.count,
    links: links
  })

})

/*
 * Route to create a new business.
 */
router.post('/', requireAuthentication, async function (req, res, next) {
  const business = req.body
  const ownerId = parseInt(business.ownerId)
  if (req.user !== ownerId && !req.isAdmin) {
    res.status(403).send({
      error: "Not authorized to access the specified resource"
    })
  }else{
    try{
      const business_data = await Business.create(req.body, BusinessClientFields)
      console.log("  -- business:", business_data.toJSON())
      res.status(201).send({
          id: business_data.id
      })
    }catch(e){
      if (e instanceof ValidationError){
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
 * Route to fetch info about a specific business.
 */
router.get('/:businessId', async function (req, res, next) {
  const businessId = req.params.businessId
  try {
    const business = await Business.findByPk(businessId, {
      include: [ Photo, Review ]
    })
    if (business) {
      res.status(200).send(business)
    } else {
      next()
    }
  } catch (e) {
    next(e)
  }
})

/*
 * Route to replace data for a business.
 */
router.put('/:businessId', requireAuthentication, async function (req, res, next) {
  const business = req.body
  const ownerId = parseInt(business.ownerId)
  const businessId = parseInt(req.params.businessId)
  try{
    const existingBusiness = await Business.findByPk(businessId);
    console.log(req.user, ownerId, existingBusiness.ownerId)
    if ((req.user !== existingBusiness.ownerId || req.user !== ownerId )&& !req.isAdmin) {
      res.status(403).send({
        error: "Not authorized to access the specified resource"
      })
    }else{
      const updatedData = {
        ownerId: business.ownerId,
        name: business.name,
        address: business.address,
        city: business.city,
        state: business.state,
        zip: business.zip,
        phone: business.phone,
        category: business.category,
        subcategory: business.subcategory,
        website: business.website,
        email: business.email,
      };
      if (!existingBusiness){
        next()
      }else{
        try{
          const business = await Business.update(updatedData,{
            where: {
              id: businessId
            }
          })
          console.log("  -- business:", business)
          res.sendStatus(204)
        }catch(e){
          if (e instanceof ValidationError) {
            res.status(400).send({ error: e.message })
          } else {
            next(e)
          }
        }
      }
    }
  }catch(e){
    next(e)
  }
})

/*
 * Route to delete a business.
 */
router.delete('/:businessId', requireAuthentication, async function (req, res, next) {
  const businessId = req.params.businessId
  try{
    const existingBusiness = await Business.findByPk(businessId);
    if (existingBusiness){
      if (req.user !== existingBusiness.ownerId && !req.isAdmin) {
        res.status(403).send({
          error: "Not authorized to access the specified resource"
        })
      }else{
        const result = await Business.destroy({ where: { id: businessId }})
        if (result > 0) {
          res.status(204).send()
        }
      }
    }else{
      next()
    }
  }catch(e){
    next(e)
  }
})
