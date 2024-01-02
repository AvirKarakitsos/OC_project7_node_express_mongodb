const express = require('express')
const bookController = require('../controllers/book');
const multer = require('../middlewares/multer-config');
const auth = require('../middlewares/auth');

const router = express.Router();

router.get('/',bookController.getAllBooks);
router.get('/bestrating',bookController.getBestRating);
router.get('/:id',bookController.getOneBook);

router.post('/',auth,multer,bookController.createBook);
router.post('/:id/rating',auth,bookController.addGrade);

router.put('/:id',auth,multer,bookController.updateBook);

router.delete('/:id',auth,bookController.deleteBook);

module.exports = router;
