const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const path = require('path');

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

// secure http headers with helmet
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

app.use(express.json());
app.use('/api/books', bookRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;
