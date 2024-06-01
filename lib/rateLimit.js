const redis = require("redis");
const {isAuthenticated} = require('./auth')

const redisHost = process.env.REDIS_HOST || "localhost";
const redisPort = process.env.REDIS_PORT || 6379;
let rateLimitMaxReqs = 5;
const rateLimitWindowMs = 60000;

const redisClient = redis.createClient({
  url: `redis://${redisHost}:${redisPort}`
});

async function rateLimit(req, res, next) {
  const ip = req.ip;
  if (isAuthenticated(req)){
    rateLimitMaxReqs = 10
  }else{
    rateLimitMaxReqs = 5
  }
  console.log(rateLimitMaxReqs)

  let tokenBucket;
  try {
    tokenBucket = await redisClient.hGetAll(ip);
  } catch (e) {
    next();
    return;
  }
  tokenBucket = {
    tokens: parseFloat(tokenBucket.tokens) || rateLimitMaxReqs,
    last: parseInt(tokenBucket.last) || Date.now()
  };

  const timestamp = Date.now();
  const ellapsedTimeMs = timestamp - tokenBucket.last;
  const refreshRate = rateLimitMaxReqs / rateLimitWindowMs;
  tokenBucket.tokens += ellapsedTimeMs * refreshRate;
  tokenBucket.tokens = Math.min(rateLimitMaxReqs, tokenBucket.tokens);
  tokenBucket.last = timestamp;

  if (tokenBucket.tokens >= 1) {
    tokenBucket.tokens -= 1;
    await redisClient.hSet(ip, [
      ['tokens', tokenBucket.tokens],
      ['last', tokenBucket.last]
    ]);
    next();
  } else {
    res.status(429).send({
      err: "Too many requests per minute"
    });
  }
}

module.exports = { rateLimit, redisClient };