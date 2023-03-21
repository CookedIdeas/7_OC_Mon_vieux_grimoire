const express = require('express');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

const router = express.Router();

const bookControllers = require('../controllers/bookControllers');

router.post('/', auth, multer, bookControllers.createBook);
router.get('/', bookControllers.getAllBooks);
router.get('/:id', bookControllers.getOneBook);
router.put('/:id', auth, multer, bookControllers.updateBook);
router.delete('/:id', auth, bookControllers.deleteOneBook);

router.post('/:id/rating', auth, bookControllers.rateBook);

module.exports = router;
