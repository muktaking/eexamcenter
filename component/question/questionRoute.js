const express = require('express');
expressValidator = require('express-validator');
const {
   body,
   query,
   param
} = require('express-validator/check');
const questionController = require('../question/questionController');
const validator = require('../utils/validation');


const router = express.Router();
router.get('/addQuestion', [
    query('qType')
    .toString()
    .trim()
    .escape()
 ], questionController.questionGet);
 
 router.post('/addQuestion', validator.extractAsObj('answers', /^answer_.{1}$/), validator.questionValidation, questionController.questionPost);
 //upload
 router.post('/addQuestion/upload',
    body('category', 'category is not valid').isMongoId(), questionController.questionUploadPost);
 //edit
 router.get('/editQuestion', [
    query('category', 'Category is invalid').isMongoId(),
    query('question', 'question is not valid').isMongoId()
 ], questionController.editQuestionGet);
 
 router.post('/editQuestion',[
    query('question','Question not Valid').isMongoId()
 ],
 validator.extractAsObj('answers', /^answer_.{1}$/), validator.questionValidation,
 questionController.editQuestionPost
 );
 
 // delete
 router.get('/deleteQuestion',
    query('question','Question not Valid').isMongoId(),
    questionController.deleteQuestionGet
 )
 router.post('/deleteQuestion',
    query('question','Question not Valid').isMongoId(),
    questionController.deleteQuestionPost
 )
 
 module.exports = router;