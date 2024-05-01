
const express = require("express")
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express')
const swaggerFile = YAML.load('./swagger.ymal')

const {validationResult} = require('express-validator')
const app = express()
const validators = require("./lib/validators.js")
const logger = require("./lib/logger.js")
const businesses = require("./data/businesses.json")
const photos = require("./data/photos.json")
const reviews =require("./data/reviews.json")

app.use(logger)
app.use(express.json())
app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))
app.get("/", function(req, res) {
    res.status(200).send({
        msg: ""
    })
});

/* -- BUSINESSES --  */
/*
 * GET /businesses/
 */
app.get("/businesses", function(req, res) {
    console.log(" -- req.query:", req.query)

    let cur_page = parseInt(req.query.page) || 1
    const{start, end, new_page, totalPages,  numPerPage} = page(cur_page, businesses)
    const prevLink = "/businesses?page=" + (new_page - 1)
    const nextLink = "/businesses?page=" + (new_page + 1)
    
    res.status(200).send({
        businesses: businesses.slice(start, end),
        page: new_page,
        totalPages: totalPages,
        numPerPage: numPerPage,
        totalCount: businesses.length,
        link: {
            nextPage: nextLink,
            lastPage: prevLink
        }
    })
});

/*
 * GET /businesses/{id}
 */
app.get("/businesses/:id", function(req, res, next) {
    const id = parseInt(req.params.id)
    let photoId = NaN
    let reviewId = NaN
    if (businesses[id]) {
        // check if business has photos
        for(const photo of photos) {
            if (parseInt(photo.businessid) === id) {
                photoId = photo.id
                break;
            }
        }
        // check if business has reviews
        for(const review of reviews) {
            if (parseInt(review.businessid) == id) {
                reviewId = review.id
                break;
            }  
        }
        res.status(200).send({
            businesses: businesses[id],
            photo: photos[photoId],
            review: reviews[reviewId]
        })
    }else{
        next()
    }
});

/*
 * POST /businesses
 */
app.post("/businesses", validators.businessValidator,function (req, res) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send({ errors: errors.array() })
    }else{
        const id = businesses.length
        res.status(201).send(
            {
                id: id
            })
    }
});

/*
 * PUT /businesses/{id}
 */
app.put("/businesses/:id",validators.businessValidator,function (req, res, next) {
    const id = parseInt(req.params.id)
    if (businesses[id]) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).send({ errors: errors.array() })
        }else{
            res.status(204).end()
        }     
    }else{
        next()
    }
});

/*
 * PATCH /businesses/{id}
 */
app.patch("/businesses/:id",validators.updateBusinessValidator,function (req, res, next) {
    const id = parseInt(req.params.id)
    if (businesses[id]) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).send({ errors: errors.array()})
        }
        res.status(204).end() 
    }else{
        next()
    }
});
/*
 * DELETE /businesses/{id}
 */
app.delete("/businesses/:id",function (req, res, next) {
    const id = parseInt(req.params.id)
    if (businesses[id]) {
        res.status(204).end() 
    }else{
        next()
    }
});
/* -- BUSINESSES --  */

/* -- REVIEWS --  */

/*
 * POST /reviews
 */
app.post("/reviews",validators.reviewValidator, function(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send({ errors: errors.array() })
    }else{
        const id = reviews.length
        res.status(201).send({ id: id })
    }
})

/*
 * PUT /reviews/{id}
 */
app.put("/reviews/:id",validators.reviewValidator, function(req, res, next) {
    const id = parseInt(req.params.id)
    const errors = validationResult(req);
    if (reviews[id]) {
        if (!errors.isEmpty()) {
            res.status(400).send({ errors: errors.array() })
        }else{
            res.status(204).end()
        }
    }else{
        next()
    }
})

/*
 * PATCH /reviews/{id}
 */
app.patch("/reviews/:id",validators.updateReviewValidator, function(req, res, next) {
    const id = parseInt(req.params.id)
    const errors = validationResult(req);
    if (reviews[id]) {
        if (!errors.isEmpty()) {
            res.status(400).send({ errors: errors.array() })
        }else{
            res.status(204).end()
        }
    }else{
        next()
    }
})

/*
 * DELETE /reviews/{id}
 */
app.delete("/reviews/:id", function(req, res, next) {
    const id = parseInt(req.params.id)
    if (reviews[id]) {
            res.status(204).end()
        }else{
            next()
        }
})
/* -- REVIEW --  */

/* -- PHOTO --  */
/*
 * POST /photos
 */
app.post("/photos", validators.photoValidator, function(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send({ errors: errors.array() })
    }else{
        const id = photos.length
        res.status(201).send({ id: id })
    }
})

/*
 * PUT /photos{id}
 */
app.put("/photos/:id", validators.photoValidator, function(req, res, next) {
    const id = parseInt(req.params.id)
    const errors = validationResult(req);
    if (reviews[id]) {
        if (!errors.isEmpty()) {
            res.status(400).send({ errors: errors.array() })
        }else{
            res.status(204).end()
        }
    }else{
        next()
    }
})
/*
 * PATCH /photos{id}
 */
app.patch("/photos/:id", validators.updatephotoValidator, function(req, res, next) {
    const id = parseInt(req.params.id)
    const errors = validationResult(req);
    if (reviews[id]) {
        if (!errors.isEmpty()) {
            res.status(400).send({ errors: errors.array() })
        }else{
            res.status(204).end()
        }
    }else{
        next()
    }
})
/*
 * DELETE /photos/{id}
 */
app.delete("/photos/:id", function(req, res, next) {
    const id = parseInt(req.params.id)
    if (reviews[id]) {
        res.status(204).end()
    }else{
        next()
    }
})
/* -- PHOTO --  */

/* -- USER --  */
/*
 * GET /user/{id}/businesses
 */
app.get("/user/:id/businesses", function(req, res, next) {
    const userId = parseInt(req.params.id)
    let cur_page = parseInt(req.params.page) || 1
    let user_businesses = []
    for (const bisiness of businesses){
        if(parseInt(bisiness.ownerid) == userId){
            user_businesses.push(bisiness)
        }
    }
    const{start, end, new_page, totalPages,  numPerPage} = page(cur_page, user_businesses)
    const prevLink = "/user/" + userId +"/businesses?page=" + (new_page - 1)
    const nextLink = "/user/" + userId +"/businesses?page=" + (new_page + 1)
    res.status(200).send({
        businesses: user_businesses.slice(start, end),
        page : new_page,
        totalPages : totalPages,
        numPerPage : numPerPage,
        totalCount : user_businesses.length,
        link: {
            nextPage:nextLink,
            lastPage:prevLink
        }
    })
})

/*
 * GET /user/{id}/reviews
 */
app.get("/user/:id/reviews", function(req, res, next) {
    const userId = parseInt(req.params.id)
    let cur_page = parseInt(req.params.page) || 1
    let user_reviews = []

    for (const review of reviews){
        if(parseInt(review.userid) == userId){
            user_reviews.push(review)
        }
    }
    const{start, end, new_page, totalPages,  numPerPage} = page(cur_page, user_reviews)
    const prevLink = "/user/" + userId +"/reviews?page=" + (new_page - 1)
    const nextLink = "/user/" + userId +"/reviews?page=" + (new_page + 1)

    res.status(200).send({
        reviews: user_reviews.slice(start, end),
        page : new_page,
        totalPages : totalPages,
        numPerPage : numPerPage,
        totalCount : user_reviews.length,
        link: {
            nextPage:nextLink,
            lastPage:prevLink
        }
    })
})

/*
 * GET /user/{id}/photos
 */
app.get("/user/:id/photos", function(req, res, next) {
    const userId = parseInt(req.params.id)
    let cur_page = parseInt(req.params.page) || 1
    let user_photos = []

    for (const photo of photos){
        if(parseInt(photo.userid) == userId){
            user_photos.push(photo)
        }
    }

    const{start, end, new_page, totalPages,  numPerPage} = page(cur_page, user_photos)
    const prevLink = "/user/" + userId +"/photos?page=" + (new_page - 1)
    const nextLink = "/user/" + userId +"/photos?page=" + (new_page + 1)

    res.status(200).send({
        photos: user_photos.slice(start, end),
        page : new_page,
        totalPages : totalPages,
        numPerPage : numPerPage,
        totalCount : user_photos.length,
        link: {
            nextPage:nextLink,
            lastPage:prevLink
        }
    })
})

/* -- USER --  */

app.use("*",function(req,res, next) {
    console.log("-- 404!")
    res.status(404).send({
      err: "Request URL not recognized: " + req.originalUrl
    })
  })

app.listen(8000, function() {
    console.log("Server is running on port 8000")
});

function page(page, object, numPerPage=10){
    const lastPage = Math.ceil(object.length / numPerPage)
    page = page > lastPage ? lastPage : page
    page = page < 1 ? 1 : page
    const start = (page - 1) * numPerPage
    const end = start + numPerPage
    return{
        start: start,
        end: end,
        new_page : page,
        totalPages : lastPage,
        numPerPage : numPerPage,
    }
}