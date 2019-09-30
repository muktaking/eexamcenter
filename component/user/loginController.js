const bcrypt = require('bcryptjs');

//importing models
const User = require('./userModel');
//controllers to handle the get request for login
module.exports.getLogin = (req,res,next)=>{
    const breadcrumbs =  req.breadcrumbs();
    let msg = req.flash('error');
    if (msg.length > 0){ 
        msg = msg[0];
    } else  {msg= null}
    res.status(200).render('user/login',{
        path: '/user/login',
        errorMessage: msg,
        breadcrumbs,
        //seo
        title: `Login: Please login to explore the site`,
        description: `to take exam, get right answer and performance graph , you have to login ` ,
        keywords: 'online, medical, post graduation, residency, fcps, frcs, MD, MS, Exam'
    });
}

module.exports.postLogin = async (req,res,next)=>{
    const email = req.body.email;
    const password = req.body.password;
    try {
        const [user] = await User.find({email});
        //console.log(user);
        if(!user){
            req.flash('error', 'Your are not registered'); // using flash to create a msg
            return res.redirect('/user/login');
        }
        //console.log(user[0].password);
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            req.flash('error', 'Your password is wrong'); // using flash to create a msg
            return res.redirect('/user/login');
        }
        req.session.isLoggedIn = true;
        req.session.user = user;
        res.redirect('/dashboard');

    } catch (error) {
        console.log(error);
    }
    
}

module.exports.postLogOut = (req,res,next)=>{
    req.session.destroy(()=>{
        res.redirect('/');
    })
};


