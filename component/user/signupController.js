const  mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransporter = require('nodemailer-sendgrid-transport')
const _ = require('lodash');
const {validationResult} = require('express-validator/check'); // validating signup, login data

const User = require('./userModel');

//declearing global variables
const role = "member";
//writing the controllers
const getSignup = (req,res,next)=>{
    const breadcrumbs =  req.breadcrumbs();
    let msg = req.flash('error');
        if (msg.length > 0){
            //console.log(req.flash('error')) 
            msg = msg[0];
        } else  {msg= null}
    res.status(200).render('user/signup',{
        path: '/user/signup',
        errorMessage: msg,
        oldInput: {email: "", password: "", re_password: ""},
        invalidErrors: [],
        breadcrumbs,
        //seo
        title: `Signup: Please signup for new account to explore the site`,
        description: `to get the advantage of this site , at first you have to sign up ` ,
        keywords: 'online, medical, post graduation, residency, fcps, frcs, MD, MS, Exam'
    });
}


const postSignup= (req,res,next)=>{
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const gender = req.body.gender;
    const errors = validationResult(req);
    const role = 'member';
    
    if (!errors.isEmpty()){
        console.log(errors.array());
        return res.status(422).render('user/signup',{
            path: '/user/signup',
            errorMessage: errors.array()[0].msg,
            oldInput: {email, password, retypePassword: req.body.retypePassword},
            invalidErrors: errors.array()
        });
    }

    bcrypt.hash(password,12)
        .then(hash=>{
            const user = new User({username,email,password:hash,gender,role});

            // create reusable transporter object using the default SMTP transport
            let transporter = nodemailer.createTransport({
                /* **for personal mail server **
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                secure: process.env.IS_SECURE, // true for 465, false for other ports
                auth: {
                user: process.env.EMAIL_USER, // generated ethereal user
                pass: process.env.EMAIL_PASSWORD // generated ethereal password
                },
                tls: {
                    rejectUnauthorized: false
                }
                */  
               // ** by sendgrid service setting**
               auth: {
                   //api_user: process.env.SENDGRID_USER,
                   api_key: process.env.SENDGRID_KEY
               }
            });

            // setup email data with unicode symbols
            let mailOptions = {
                from: `No-reply from <${process.env.SENDER_EMAIL}>`, // sender address
                to: email, // list of receivers
                subject: "Thank you, " + username, // Subject line
                text: "Thank You for your registration to our site", // plain text body
            };
            // send mail with defined transport object
            transporter.sendMail(mailOptions,(error, info)=>{
                if(error){
                    console.log(error);
                }
            })

            //console.log("Message sent: %s", info.messageId);
            // Preview only available when sending through an Ethereal account
            //console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
            return user.save();
            
        }).then(isSaved=>{
            res.redirect('/user/login');
            //console.log(isSaved);
        })
        .catch(err=>{
            console.log(err);
        })
}



module.exports ={
    getSignup,
    postSignup
}