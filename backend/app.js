const express = require('express');
const mongoose = require('mongoose');

//Get .env variables
const dotenv = require('dotenv');
dotenv.config();
const mongoUserName = `${process.env.MONGOATLAS_USERNAME}`;
const mongoPassword = `${process.env.MONGOATLAS_PASSWORD}`;

// const { json } = require('express');

const bookRoutes = require('./routes/bookRoutes');

mongoose
  .connect(
    `mongodb+srv://${mongoUserName}:${mongoPassword}@cluster-monvieuxgrimoir.d8g8mdx.mongodb.net/test?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();

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

module.exports = app;
