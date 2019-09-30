const express = require('express');
const {check,body,query} = require('express-validator/check');

const router = express.Router();
//importing controllers
const signupController = require('../user/signupController');
const loginController = require('../user/loginController');
const resetController = require('../user/resetController');
const newPasswordController = require('../user/newPasswordController');
//importing models
const User = require('../user/userModel');
//breadcrumbs
const breadcrumbs = require('../utils/breadcrumbs').breadcrumbs; 

//routing signUp
router.get('/signup', breadcrumbs('Signup','/user/signup'),signupController.getSignup);
router.post('/signup',[
    body('username',"Invalid username. Username should be at least 5 alpha-numeric characters")
        .isAlphanumeric()
        .isLength({min: 5})
        .trim()
        .escape(),
    body('email')
        .isEmail()
        .withMessage('Invalid Email')
        .trim()
        .normalizeEmail()
        .custom((value,{req})=>{
            return User.find({email: value})
                .then(userDoc=>{
                    if(userDoc){
                        return Promise.reject('The Email is already exists');
                    }
                })
                .catch(err=>{
                    console.log(err);
                })
        }),
    body('password','Please enter valid password. Password should be at least 5 alpha-numeric characters')
        .isLength({min: 5})
        .isAlphanumeric()
        .trim()
        .escape(),
    body('confirmPassword')
        .trim()
        .escape()
        .custom((value,{req})=>{
            if(value !== req.body.password){
                throw new Error('Password confirmation does not match password')
            }
            return true;
        })    
],signupController.postSignup);

//routing login 
router.get('/login',  breadcrumbs('Login','/user/login'),loginController.getLogin);
router.post('/login',loginController.postLogin);
//routing logout
router.post('/logout', loginController.postLogOut);
//routing reset
router.post('/reset',resetController.postReset);

router.get('/reset/:token',  breadcrumbs('Reset','/user/reset'),newPasswordController.getNewPassword);
router.post('/reset/:token', [
    body('password','Please enter valid password. Password should be at least 5 alpha-numeric characters')
        .isLength({min: 5})
        .isAlphanumeric()
        .trim()
        .escape(),
    body('confirmPassword')
        .trim()
        .escape()
        .custom((value,{req})=>{
            if(value !== req.body.password){
                throw new Error('Password confirmation does not match password')
            }
            return true;
        }) 
] ,newPasswordController.postNewPassword);

module.exports = router;
