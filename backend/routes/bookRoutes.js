const express = require('express');
const router = express.Router();

const bookControllers = require('../controllers/bookControllers');

router.post('/', bookControllers.createBook);
router.get('/', bookControllers.getAllBooks);
router.get('/:id', bookControllers.getOneBook);
router.put('/:id', bookControllers.updateBook);
router.delete('/:id', bookControllers.deleteOneBook);

module.exports = router;
