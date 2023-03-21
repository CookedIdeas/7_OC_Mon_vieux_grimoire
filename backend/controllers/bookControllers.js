const Book = require('../models/BookSchema');

exports.createBook = (req, res, next) => {
  const newBook = new Book({
    // // id: '1',
    // userId: 'clc4wj5lh3gyi0ak4eq4n8syr',
    // title: 'Milwaukee Mission',
    // author: 'Elder Cooper',
    // imageUrl: 'https://via.placeholder.com/206x260',
    // year: 2021,
    // genre: 'Policier',
    // ratings: [
    //   {
    //     userId: '1',
    //     grade: 5,
    //   },
    //   {
    //     userId: '1',
    //     grade: 5,
    //   },
    //   {
    //     userId: 'clc4wj5lh3gyi0ak4eq4n8syr',
    //     grade: 5,
    //   },
    //   {
    //     userId: '1',
    //     grade: 5,
    //   },
    // ],
    // averageRating: 3,
    ...req.body,
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
  Book.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
    .then((book) => res.status(200).json({ message: 'Objet modifié' }))
    .catch((error) => res.status(400).json({ error }));
};

exports.deleteOneBook = (req, res, next) => {
  Book.deleteOne({ _id: req.params.id })
    .then((book) => res.status(200).json({ message: 'Objet supprimé' }))
    .catch((error) => res.status(400).json({ error }));
};
