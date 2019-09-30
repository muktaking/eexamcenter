const express = require('express');
expressValidator = require('express-validator');
const {
   body,
   query,
   param
} = require('express-validator/check');
const categoryController = require('./categoryController');
const validator = require('../utils/validation');


const router = express.Router();

// Category routes
//create
router.get('/', categoryController.getCategory);
router.post('/', validator.categoryValidation, categoryController.PostCategory);
//edit
router.get('/editCategory/:id',
   param('id', 'Category is not valid').isMongoId(), categoryController.editCategoryGet);
router.post('/editCategory/:id', validator.categoryValidation, categoryController.editCategoryPost);
//delete
router.get('/deleteCategory/:id',
   param('id', 'Category is not valid').isMongoId(),
   categoryController.deleteCategoryGet);

router.post('/deleteCategory/:id',
   param('id', 'Category is not valid').isMongoId(), categoryController.deleteCategoryPost);


module.exports = router;

