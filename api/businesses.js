const router = require('express').Router()
const { validateAgainstSchema, extractValidFields } = require('../lib/validation')
const { ValidationError } = require("sequelize")
const businesses = require('../data/businesses')
const { reviews } = require('./reviews')
const { photos } = require('./photos')
const Business = require("../models/business")
const Photo = require('../models/photo')
const Review = require('../models/review')

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
router.post('/', async function (req, res, next) {
  try{
    const business = await Business.create(req.body,[
      "ownerId",
      "name",
      "address",
      "city",
      "state",
      "zip",
      "phone",
      "category",
      "subcategory",
      "website",
      "email"
    ])

    console.log("  -- business:", business.toJSON())
    res.status(201).send({
        id: business.id
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
  
})

/*
 * Route to fetch info about a specific business.
 */
router.get('/:businessId', async function (req, res, next) {
  const businessId = parseInt(req.params.businessId)
  const business = await Business.findByPk(businessId, {
    include: [Photo, Review]
  })
  if (business){
    res.status(200).send(business)
  }else{
    next()
  }
})

/*
 * Route to replace data for a business.
 */
router.put('/:businessId', async function (req, res, next) {
  const businessId = parseInt(req.params.businessId)
  const existingBusiness = await Business.findByPk(businessId);
  const updatedData = {
    ownerId: req.body.ownerId,
    name: req.body.name,
    address: req.body.address,
    city: req.body.city,
    state: req.body.state,
    zip: req.body.zip,
    phone: req.body.phone,
    category: req.body.category,
    subcategory: req.body.subcategory,
    website: req.body.website,
    email: req.body.email,
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
      next(e)
    }
  }
})

/*
 * Route to delete a business.
 */
router.delete('/:businessId', async function (req, res, next) {
  const businessId = parseInt(req.params.businessId);
  const existingBusiness = await Business.findByPk(businessId);
  if (!existingBusiness) {
    next()
  }else{
    try{
      await Business.destroy({
        where: {
          id: businessId
        }
      })
      res.sendStatus(204)
    }catch(e){
      next(e)
  }
}
})
