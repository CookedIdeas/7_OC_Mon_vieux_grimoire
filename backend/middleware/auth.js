const jwt = require('jsonwebtoken');
const validator = require('validator');
const sanitize = require('mongo-sanitize');
const { body } = require('express-validator');

//Get .env variables
const dotenv = require('dotenv');
dotenv.config();
const tokenRandomSecret = `${process.env.RANDOM_TOKEN_SECRET}`;

module.exports = (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];

  // SECURITY : check if token is a JsonWebToken
  if (!validator.isJWT(token)) {
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
    res.status(403).json({ error });
  }
};
