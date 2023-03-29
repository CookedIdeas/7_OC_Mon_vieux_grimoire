const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const path = require('path');
const contentType = require('content-type');
const getRawBody = require('raw-body');
const filter = require('content-filter');
const sanitize = require('mongo-sanitize');
const toobusy = require('toobusy-js');
const logger = require('./logger');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');

//Get .env variables
const dotenv = require('dotenv');
dotenv.config();
const mongoUserName = `${process.env.MONGOATLAS_USERNAME}`;
const mongoPassword = `${process.env.MONGOATLAS_PASSWORD}`;

// const { json } = require('express');

const bookRoutes = require('./routes/bookRoutes');
const userRoutes = require('./routes/userRoutes');

mongoose
  .connect(
    `mongodb+srv://${mongoUserName}:${mongoPassword}@cluster-monvieuxgrimoir.d8g8mdx.mongodb.net/test?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();

//SECURITY : protect against HTTP Parameter Pollution attacks
app.use(hpp());

//SECURITY : toobusy package send response if server is too busy
//Keeps the app responsive
//Protection against DoS Attack
app.use(function (req, res, next) {
  if (toobusy()) {
    logger.log('verbose', `server is too busy`);
    res.status(503).send('Server Too Busy');
  } else {
    next();
  }
});

//SECURITY :  secure http headers with helmet
// allow cross-origin resource policy to allow access to images stored on localhost 4000
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  );
  next();
});

// SECURITY : limit requests size
app.use(express.json({ limit: '1kb' }));
app.use(express.urlencoded({ limit: '1kb', extended: false }));

// SECURITY : prevent NoSQL injection -> ne permet pas d'envoyer "{" ou "$" etc...
// blacklist from https://github.com/cr0hn/nosqlinjection_wordlists
let blackList = ['$', '{', '&&', '||', '%00', "';sleep(5000);"];
let filterOptions = {
  urlBlackList: blackList,
  bodyBlackList: blackList,
};
app.use(filter(filterOptions));

app.use('/api/books', bookRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;
