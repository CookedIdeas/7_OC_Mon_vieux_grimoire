const jwt = require('jsonwebtoken');
const validator = require('validator');
const sanitize = require('mongo-sanitize');
const { body } = require('express-validator');
const logger = require('../logger');

//Get .env variables
const dotenv = require('dotenv');
dotenv.config();
const tokenRandomSecret = `${process.env.RANDOM_TOKEN_SECRET}`;

module.exports = (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];
  if (!token) {
    logger.log(
      'verbose',
      `A jwt is missing in a request asking for it. req.headers: ${JSON.stringify(
        req.headers
      )}`
    );
    res.status(403).json({ error });
  }

  // SECURITY : check if token is a JsonWebToken
  if (!validator.isJWT(token)) {
    logger.log(
      'verbose',
      `A jwt has been submitted but is not a jwt. jwt: ${token}`
    );
    return res.status(403).json({ error });
  }
  // SECURITY : sanitize the JsonWebToken
  const sanitizedToken = sanitize(token);
  body(sanitizedToken).trim().escape();

  try {
    const decodedToken = jwt.verify(sanitizedToken, tokenRandomSecret);
    const userId = decodedToken.userId;
    req.auth = {
      userId: userId,
    };
    next();
  } catch (error) {
    logger.log(
      'verbose',
      `A jwt as been submitted but isn't verified. jwt: ${token}`
    );
    res.status(403).json({ error });
  }
};
