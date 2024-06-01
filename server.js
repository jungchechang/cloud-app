const express = require('express');
const https = require('https');
const fs = require('fs');
const morgan = require('morgan');
const sequelize = require("./lib/sequelize");
const { Business } = require("./models/business");
const { Photo } = require('./models/photo');
const { Review } = require('./models/review');
const { User } = require('./models/user');
const { connectToRabbitMQ, getChannel, queueName } = require('./lib/rabbitmq')
const {rateLimit, redisClient} = require('./lib/rateLimit')
const businesses = require('./data/businesses.json');
const reviews = require('./data/reviews.json');
const photos = require('./data/photos.json');
const api = require('./api');

const app = express();
const port = process.env.PORT || 8000;

// SSL Certificate
const privateKey = fs.readFileSync('./certificate/key.pem', 'utf8');
const certificate = fs.readFileSync('./certificate/cert.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };


// Morgan is a popular request logger.
app.use(morgan('dev'));
app.use(express.json());
app.use(express.static('public'));


// Initialize Database
async function initializeDatabase() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        await sequelize.sync({ force: true });
        console.log('Tables has been successfully created.');
        await Business.bulkCreate(businesses);
        console.log('Business data has been sulsccessfully created.');
        await Review.bulkCreate(reviews);
        console.log('Review data has been successfully created.');
        await Photo.bulkCreate(photos);
        console.log('Photo data has been successfully created.');
    } catch (error) {
        console.error('Error during the initialization of the database:', error);
    }
}

initializeDatabase();


app.use(rateLimit)

app.use('/', api);

app.use('*', function (req, res, next) {
    res.status(404).send({
        error: `Requested resource "${req.originalUrl}" does not exist`
    });
});

app.use('*', function (err, req, res, next) {
    console.error("== Error:", err);
    res.status(500).send({
        error: "Server error. Please try again later."
    });
});

// Create HTTPS server
const httpsServer = https.createServer(credentials, app);

redisClient.connect().then(async () => {
    console.log("Connected to Redis");
    await connectToRabbitMQ()
    httpsServer.listen(port, function() {
        console.log("== HTTPS Server is running on port", port);
    });
  }).catch(console.error);