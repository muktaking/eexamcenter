// routing exam
const express = require('express');
const {check,body,query} = require('express-validator/check');
const validator = require('../utils/validation');
const isAuth = require('../utils/isAuth');

const router = express.Router();
//importing model
const examController = require('../exam/examController');
const demoController = require('../exam/demoExamController');
//breadcrumbs
const breadcrumbs = require('../utils/breadcrumbs').breadcrumbs;
//global variable Global list
//exam
router.get('/', examController.examGet);
router.get('/category', breadcrumbs('Category', '/exam/category'),  examController.categoryGet);
router.get('/category/:categoryName',[
   check('categoryName', "Category is not well format").whitelist(['[a-zA-Z0-9]','%20','-'])
], breadcrumbs('Category', '/exam/category', 'categoryName'),examController.examGet);
router.get('/category/:categoryName/*',[
    [
        check('categoryName', "Category is not well format").whitelist(['[a-zA-Z0-9]','%20','-']).custom((value,{req})=>{
            let regex = /[\w\d(%20)-\/]/g;
                const isMatch = regex.test(req.path);
                if (!isMatch) {
                    throw new Error('category is not well formated');
                }
                return true;
        }) 
     ]
], breadcrumbs('Category', '/exam/category', 'categoryName'),examController.examGet);
router.get('/topic/:topic', isAuth.restrictByRole('member'),[
    check('topic', "Topic is not well format").whitelist(['[a-zA-Z0-9]','%20','-'])
], breadcrumbs('Topic', '/exam/topic', 'topic'), examController.examGet)
router.get('/topic/:topic/*',  isAuth.restrictByRole('member'),[
    check('topic', "Topic is not well format").whitelist(['[a-zA-Z0-9]','%20','-']).custom((value,{req})=>{
        let regex = /[\w\d(%20)-\/]/g;
            const isMatch = regex.test(req.path);
            if (!isMatch) {
                throw new Error('topic is not well formated');
            }
            return true;
    }) 
], breadcrumbs('Topic', '/exam/topic', 'topic'), examController.examGet);
router.post('/', validator.examValidation, examController.examPost);
//demo
router.get('/demo', breadcrumbs('Demo', '/exam/demo'), demoController.examGet);
router.post('/demo', validator.examValidation, demoController.examPost);

module.exports = router;
