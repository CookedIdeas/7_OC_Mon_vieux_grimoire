const express = require('express');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const { checkSchema } = require('express-validator');

const router = express.Router();

const bookControllers = require('../controllers/bookControllers');
const inputsValidators = require('../security/inputsValidators');

router.get('/bestrating', bookControllers.bestRatings);

router.post(
  '/validateBooksInputs',
  auth,
  inputsValidators.bookValidator,
  bookControllers.validateBook
);

router.post('/', auth, multer, bookControllers.createBook);

router.get('/', bookControllers.getAllBooks);

router.get('/:id', bookControllers.getOneBook);

router.put(
  '/:id',
  auth,
  multer,
  //   checkSchema(inputsValidation.validatorBookSchema),
  bookControllers.updateBook
);

router.delete('/:id', auth, bookControllers.deleteOneBook);

router.post('/:id/rating', auth, bookControllers.rateBook);

module.exports = router;
