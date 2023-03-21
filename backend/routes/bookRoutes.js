const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

const bookControllers = require('../controllers/bookControllers');

router.post('/', auth, bookControllers.createBook);
router.get('/', bookControllers.getAllBooks);
router.get('/:id', bookControllers.getOneBook);
router.put('/:id', auth, bookControllers.updateBook);
router.delete('/:id', auth, bookControllers.deleteOneBook);

module.exports = router;
