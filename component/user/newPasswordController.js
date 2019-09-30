const bcrypt = require('bcryptjs');
const {validationResult} = require('express-validator/check'); // validating signup, login data

//importing models
const User = require('./userModel');

module.exports.getNewPassword = async(req, res, next)=>{
    const breadcrumbs =  req.breadcrumbs();
    const token = req.params.token;
    const user = await User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}});
        
    if(user){
        let msg = req.flash('error');
        if (msg.length > 0){ 
            msg = msg[0];
        } else  {msg= null}

        res.status(200).render('user/new-password',{
            errorMessage: msg,
            userId: user._id.toString(),
            passwordToken: token,
            breadcrumbs,
            //seo
            title: `Reset: reset your password if forget`,
            description: `to take exam, get right answer and performance graph , you have to login ` ,
            keywords: 'online, medical, post graduation, residency, fcps, frcs, MD, MS, Exam'
        })
    }
    else{
        res.status(422).render('user/new-password',{
            tokenErrorMessage: 'Token may be wrong or Token expired',
            breadcrumbs,
            //seo
            title: `Reset: reset your password if forget`,
            description: `to take exam, get right answer and performance graph , you have to login ` ,
            keywords: 'online, medical, post graduation, residency, fcps, frcs, MD, MS, Exam'
        });
    }
    
}

module.exports.postNewPassword = async(req, res, next)=>{
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    const errors = validationResult(req);

    
    if (!errors.isEmpty()){
        console.log(errors.array());
        return res.status(422).render('user/new-password',{
            errorMessage: errors.array()[0].msg,
            invalidErrors: errors.array(),
            userId: userId,
            passwordToken: passwordToken,
            //seo
            title: `Reset: reset your password if forget`,
            description: `to take exam, get right answer and performance graph , you have to login ` ,
            keywords: 'online, medical, post graduation, residency, fcps, frcs, MD, MS, Exam'
        });
    }

    const user = await User.findOne({
        resetToken: passwordToken, 
        resetTokenExpiration: {$gt: Date.now()}, 
        _id: userId
    });

    if(user){
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        user.password = hashedPassword;
        user.resetToken = null;
        user.resetTokenExpiration = undefined;
        await user.save();
        res.redirect('/user/login');
    }
    else{
        res.status(422).render('user/new-password',{
            tokenErrorMessage: 'Token may be wrong or Token expired',
        })
    }
}