const Book = require('../models/BookSchema');
const fs = require('fs');

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
    .catch((error) => res.status(400).json({ error }));
};

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

exports.getOneBook = (req, res, next) => {
  Book.find({ _id: req.params.id })
    .then((book) => res.status(200).json(book[0]))
    .catch((error) => res.status(404).json({ error }));
};

exports.updateBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };
  delete bookObject._userId;
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: 'Modification non autorisée' });
      } else {
        Book.updateOne(
          { _id: req.params.id },
          { ...bookObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: 'Objet modifié' }))
          .catch((error) => res.status(500).json({ error }));
      }
    })
    .catch((error) => res.status(400).json({ error }));
};

exports.deleteOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: 'Suppression non autorisée' });
      } else {
        const filename = book.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Objet supprimé' }))
            .catch((error) => res.status(400).json({ error }));
        });
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

// =========================== RATINGS =========================== //

exports.rateBook = (req, res, next) => {
  //1 : find the right book in db
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      //right book has been found
      //2 : check if this user has already rated this book
      const previousUserRate = book.ratings.filter(
        (rate) => rate.userId === req.auth.userId
      );
      const previousRates = book.ratings.map((a) => a.grade);
      console.log(previousRates);
      // if previousUserRate === []/previousUserRate.length === 0, user hasn't rate this book already
      if (book.userId === req.auth.userId || previousUserRate.length !== 0) {
        res.status(401).json({
          message: 'Notation non autorisée, vous avez déjà noté ce livre !',
        });
      } else {
        //calculate new average rating
        previousRates.push(req.body.rating);
        const ratingTotal = previousRates.reduce(
          (accumulator, currentValue) => accumulator + currentValue,
          0
        );
        const newAverageRating = ratingTotal / previousRates.length || 0;

        // let's push a new pair user/rates to the ratings of this book
        // and update the averageRating with the newAverageRating, keeping only one digit if needed
        Book.updateOne(
          { _id: req.params.id },
          {
            $push: {
              ratings: { userId: req.auth.userId, grade: req.body.rating },
            },
            averageRating: parseFloat(newAverageRating).toFixed(1),
          }
        )
          .then(() =>
            //the right book has been updated
            //let's send it back to frontend
            Book.findOne({ _id: req.params.id })
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
