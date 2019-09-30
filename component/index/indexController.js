const express = require('express');
const router = express.Router();

router.get('/',(req,res,next)=>{
    res.status(200).render('index',{
        path: '/',
        role: req.session.user ? req.session.user.role : null  ,
        isAuthenticated: req.session.isLoggedIn,
        //seo
        title: 'Online Medical Post Graduation Residency Exam Platform for medical Student',
        description: 'Online based coaching specially designed to take exam for post graduation medical entrance exam',
        keywords: 'online, medical, post graduation, residency, fcps, frcs, MD, MS, Exam'
    });
});

module.exports = router;