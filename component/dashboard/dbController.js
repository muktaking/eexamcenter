const _ = require('lodash');
//importing model
const Exam = require('../exam/examModel');
module.exports.dBoardController = async(req,res,next)=>{
    userName = req.session.user.username;
    userId = req.session.user._id;
    
    const [profile] = await Exam.find({user: userId});
    if(!profile){
        return res.status(200).render('dashboard/dashboard',{
            path: '/dashboard',
            userName, 
            totalAvgScore: 0, 
            examTaken: 0, 
            highestMark: 0, 
            lowestMark: 0
        });
    } 
    const totalAvgScore = Number(_.sum(_.map(profile.exams, 'averageScore')).toFixed(2));
    const examTaken = profile.exams.length;
    const highestMark = _.sortBy(profile.exams, 'averageScore')[0].averageScore.toFixed(2);
    const lowestMark = _.sortBy(profile.exams, 'averageScore').reverse()[0].averageScore.toFixed(2);


    res.status(200).render('dashboard/dashboard',{
        path: '/dashboard',
        userName, totalAvgScore, examTaken, highestMark, lowestMark});
}
