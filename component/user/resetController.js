//reset controller for sending reset email

const crypto = require('crypto');
const nodemailer = require('nodemailer');
const sendgridTransporter = require('nodemailer-sendgrid-transport');
//importing models
const User = require('./userModel');


module.exports.postReset = (req,res,next)=>{

    crypto.randomBytes(32, (err, buffer)=>{
        if(err){
            console.log(err);
            return req.redirect('/user/login');
        }

        const token = buffer.toString('hex');
        User.findOne({email: req.body.email})
        .then( user=>{

            if(!user){
                return res.redirect('/'); // DO SOME RENDER PAGE
            }
            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + (3*60*60*1000);
            user.save()
            .then(saved=>{
                res.redirect('/');
                // create reusable transporter object using the default SMTP transport
                let transporter = nodemailer.createTransport(
                    /* by personal mail use
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
                   sendgridTransporter({
                        auth: {
                            //api_user: process.env.SENDGRID_USER,
                            api_key: process.env.SENDGRID_KEY
                        }
                   })
                );

                // setup email data with unicode symbols
                let mailOptions = {
                    from: `"No-reply" <${process.env.SENDER_EMAIL}>`, // sender address
                    to: req.body.email, // list of receivers
                    subject: "Reset Your Password, ", // Subject line
                    html: `<h3>Reset Your Password</h3>
                            <p>If you request for password reset, click this <a href="http://${process.env.DOMAIN}/user/reset/${token}">link</a></p>
                    ` // html body
                };
                // send mail with defined transport object
                transporter.sendMail(mailOptions,(error, info)=>{
                    if(error){
                        console.log(error);
                    }
                    console.log(info);
                })
            })
            .catch(err=>{
                console.log(err);
            });
        }
        )
        .catch(err=>{
            console.log(err);
        });

    })
}