const Book = require('../models/BookSchema');
const fs = require('fs');
const validator = require('validator');
const sanitize = require('mongo-sanitize');
const {
  body,
  validationResult,
  checkSchema,
  check,
} = require('express-validator');
const multer = require('multer');
const logger = require('../logger');
const parseRequest = require('parse-request');
const mongoSanitize = require('express-mongo-sanitize');

// ============= CHECK VALIDITY OF ITEM ID AND SANITIZE IT ============= //

let sanitizedBookId;

const checkAndSanitizeBookId = (idFromParams) => {
  // SECURITY : check if book id is a mongoDB Id
  if (!validator.isMongoId(idFromParams)) {
    logger.log('verbose', `${idFromParams} is not a mongoId`);
    return res.status(403).json({ error });
  }
  // SECURITY : sanitize the book id
  sanitizedBookId = sanitize(String(idFromParams));
  body(sanitizedBookId).trim().escape();
};

exports.validateBook = (req, res, next) => {
  //SECURITY : validate, trim, escape and sanitize inputs with express-validator checkSchema method
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(403).json({ errors: errors.array() });
  } else {
    return res.status(200).json({ message: 'inputs are ok !' });
  }
};

exports.validateImageSize = (req, res, next) => {
  const reqSize = parseInt(req.headers['content-length']);
  const maxSize = 4194304; //4Mo
  if (reqSize <= maxSize) {
    next();
  } else {
    return res
      .status(430)
      .json({ message: 'Votre image est trop volumineuse. Limite max : 4Mo' });
  }
};

exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;

  const newBook = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${
      req.file.filename
    }`,
  });

  newBook
    .save()
    .then(() => res.status(201).json({ message: 'Book enregistré ! ' }))
    .catch((error) => res.status(402).json({ error }));
};

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

exports.getOneBook = (req, res, next) => {
  // SECURITY : check if book id is a mongoDB Id and sanitize it
  checkAndSanitizeBookId(req.params.id);

  Book.findOne({ _id: sanitizedBookId })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ error }));
};

exports.updateBook = (req, res, next) => {
  // SECURITY : check if book id is a mongoDB Id and sanitize it
  checkAndSanitizeBookId(req.params.id);

  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };
  delete bookObject._userId;

  Book.findOne({ _id: sanitizedBookId })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: 'Modification non autorisée' });
        logger.log(
          'verbose',
          `Unauthorized book ${book} update by ${req.auth.userId} who is not user : ${book.userId}`
        );
      } else {
        Book.updateOne(
          { _id: sanitizedBookId },
          { ...bookObject, _id: sanitizedBookId }
        )
          .then(() => res.status(200).json({ message: 'Objet modifié' }))
          .catch((error) => res.status(500).json({ error }));
      }
    })
    .catch((error) => res.status(400).json({ error }));
  // }
};

exports.deleteOneBook = (req, res, next) => {
  // SECURITY : check if book id is a mongoDB Id and sanitize it
  checkAndSanitizeBookId(req.params.id);

  Book.findOne({ _id: sanitizedBookId })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: 'Suppression non autorisée' });
        logger.log(
          'verbose',
          `Unauthorized book ${book._id} delete by ${req.auth.userId} who is not user : ${book.userId}`
        );
      } else {
        const filename = book.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: sanitizedBookId })
            .then(() => res.status(200).json({ message: 'Objet supprimé' }))
            .catch((error) => res.status(400).json({ error }));
        });
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

// =========================== RATINGS =========================== //

exports.rateBook = (req, res, next) => {
  // SECURITY : check if book id is a mongoDB Id and sanitize it
  checkAndSanitizeBookId(req.params.id);

  // SECURITY : check if submitted grade is integer >0 and <5, sanitize it
  if (!validator.isInt(String(req.body.rating), { min: 1, max: 5 })) {
    logger.log(
      'verbose',
      `${req.body.userId} as submitted a not validated rate`
    );
    return res.status(403).json({ error });
  }
  const sanitizedGrade = sanitize(req.body.rating);

  //1 : find the right book in db
  Book.findOne({ _id: sanitizedBookId })
    .then((book) => {
      //right book has been found
      //2 : check if this user has already rated this book
      const previousUserRate = book.ratings.filter(
        (rate) => rate.userId === req.auth.userId
      );
      const previousRates = book.ratings.map((a) => a.grade);
      // if previousUserRate === []/previousUserRate.length === 0, user hasn't rate this book already
      if (book.userId === req.auth.userId || previousUserRate.length !== 0) {
        res.status(401).json({
          message: 'Notation non autorisée, vous avez déjà noté ce livre !',
        });
      } else {
        //calculate new average rating
        previousRates.push(sanitizedGrade);
        const ratingTotal = previousRates.reduce(
          (accumulator, currentValue) => accumulator + currentValue,
          0
        );
        const newAverageRating = ratingTotal / previousRates.length || 0;

        // let's push a new pair user/rates to the ratings of this book
        // and update the averageRating with the newAverageRating, keeping only one digit if needed
        Book.updateOne(
          { _id: sanitizedBookId },
          {
            $push: {
              ratings: { userId: req.auth.userId, grade: sanitizedGrade },
            },
            averageRating: parseFloat(newAverageRating).toFixed(1),
          }
        )
          .then(() =>
            //the right book has been updated
            //let's send it back to frontend
            Book.findOne({ _id: sanitizedBookId })
              .then((book) => {
                res.status(200).json(book);
              })
              .catch((error) => res.status(500).json({ error }))
          )
          .catch((error) => res.status(400).json({ error }));
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.bestRatings = (req, res, next) => {
  Book.find()
    .then((books) => {
      //sort books by average rating from best to lamest
      const sortedBooks = books.sort((a, b) => {
        return b.averageRating - a.averageRating;
      });

      // keep the first 3 books and send them to front
      const best3Books = sortedBooks.slice(0, 3);

      res.status(200).json(best3Books);
    })
    .catch((error) => res.status(400).json({ error }));
};
