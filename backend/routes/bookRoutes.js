const express = require('express');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const { checkSchema } = require('express-validator');

const router = express.Router();

const bookControllers = require('../controllers/bookControllers');
const inputsValidators = require('../security/inputsValidators');

// == PUBLIC ROUTES == /

router.get('/bestrating', bookControllers.bestRatings);
router.get('/', bookControllers.getAllBooks);
router.get('/:id', bookControllers.getOneBook);

// == PROTECTED ROUTES == //

// post book routes
router.post(
  '/validateBooksInputs',
  auth,
  inputsValidators.bookValidator,
  bookControllers.validateBook
);
router.post(
  '/',
  auth,
  bookControllers.validateImageSize,
  multer,
  bookControllers.createBook
);

router.put(
  '/:id',
  auth,
  bookControllers.validateImageSize,
  multer,
  bookControllers.updateBook
);

router.delete('/:id', auth, bookControllers.deleteOneBook);

router.post('/:id/rating', auth, bookControllers.rateBook);

module.exports = router;
