const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const _ = require('lodash');
const createError = require('http-errors');
const XLSX = require('xlsx');
const {
    validationResult
} = require('express-validator/check');

//importing model
const Category = require('../category/categoryModel');
const Question = require('../question/questionModel');

//importing controller
const matrixController = require('./matrixController');
const sbaController = require('./sbaController');

module.exports.questionGet = async (req, res, next) => {
    const qType = req.query.qType;
    let msg = req.flash('error');
    if (msg.length > 0) {
        //console.log(req.flash('error')) 
        msg = msg[0];
    } else {
        msg = null
    }

    try {
        const category = await Category.find({}).sort({
            'slug': 1
        });

        if (qType) {
            if (qType === 'matrix') {
                return res.status(200).render('question/addQuestion', {
                    path:'/question/addQuestion',
                    qType,
                    category,
                    errorMessage: msg,
                });
            } else if (qType === 'sba') {
                return res.status(200).render('question/addQuestion', {
                    path:'/admin/addQuestion',
                    qType,
                    category,
                    errorMessage: msg,
                });
            } else if (qType === 'excel') {
                return res.status(200).render('question/addQuestion', {
                    path:'/admin/addQuestion',
                    qType,
                    category,
                    errorMessage: msg,
                });
            }
            return res.status(200).render('question/question',{
                path:'/question/question',
            });
        }
        res.status(200).render('question/question',{
            path:'/question/question',
        });
    } catch (error) {
        console.log(error);
    }
}
module.exports.questionPost = async (req, res, next) => {

    const title = req.body.title;
    const category = mongoose.Types.ObjectId(req.body.category);
    const qType = req.body.qType;
    const text = req.body.text;
    let stems = req.body.stems;
    let answers = req.body.answers;
    let feedbacks = req.body.feedbacks;
    const generalFeedbacks = req.body.generalFeedbacks;
    let tags = _.words(req.body.tags);
    let stemErrors = '';

    //console.log(stems, answers, feedbacks);
    if (qType === 'matrix') {
        stemErrors = matrixController.stemChecking(stems, answers, feedbacks);
        answers = _.toArray(answers);
    } else if (qType === 'sba') {
        stemErrors = sbaController.stemChecking(stems, answers, feedbacks);
        answers = _.toArray(answers);
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('error', errors.array()[0].msg);
        return res.redirect(req.originalUrl);
    }
    if (stemErrors.length > 0) {
        req.flash('error', stemErrors);
        return res.redirect(req.originalUrl);
    }
    const stemBody = {
        stems: _.compact(stems),
        answers: _.compact(answers),
        feedbacks: feedbacks
    }

    const question = new Question({
        title,
        category,
        type: qType,
        text,
        stemBody,
        generalFeedbacks,
        tags,
        creator: req.session.user._id
    });
    try {
        
        const isSaved = await question.save();
        return res.redirect(req.originalUrl);
    } catch (error) {
        console.log(error);
        return next(createError(422, 'Question can not be saved'));
    }
}

module.exports.questionUploadPost = async (req, res, next) => {
    let excel = '';
    let data = [];
    try {
        if (!req.files.excel) {
            console.log(req.files.excel);
            return res.redirect('/question/addQuestion?qType=excel');
        }
        excel = path.dirname(require.main.filename) + '/' + req.files.excel[0].path;
        const workbook = XLSX.readFile(excel);
        data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {
            header: 1,
            raw: false,
            defval: ''
        });

    } catch (error) {
        return next(error);
    }

    fs.unlink(excel, (err) => {
        if (err) {
            console.log(err);
            return next(createError(422, 'File can not be deleted'));
        }
    });

    try {
        const category = req.body.category;
        const user = req.session.user._id;
        const header = data.shift();
        const result = toCollection(data, category, user);
        if (result.allData.length > 1) {
            const isSaved = await Question.insertMany(result.allData);
            if (isSaved) {
                return res.status(200).send(`<div>${result.allData}</div><div>${result.errorIndex}</div><div>${result.errorMessage}</div>`);
            } else {
                //console.log(isSaved);
                return res.redirect('/question/addQuestion?qType=excel')
            }
        }
    } catch (error) {
        next(error);
    }
}

//editQuestionGet 
module.exports.editQuestionGet = async(req, res, next)=>{
    
    // the order is descending in frontend

    let msg = req.flash('error');
    if (msg.length > 0) {
        //console.log(req.flash('error')) 
        msg = msg[0];
    } else {
        msg = null
    }

    //--------- this question will be edited -------------> 
    const questionId = req.query.question;
    if(questionId){
        const [question] = await Question.find({_id: questionId});
        const categoryList = await Category.find({}).sort({
            'slug': 1
        });
        return res.status(200).render('question/editThisQuestion',{
            path: '/question/editQuestion',
            question, 
            qType: question.type, 
            category: categoryList, 
            errorMessage: msg
        });
    }

    //--------- questions of this category will be edited -------------> 
    const categoryId = req.query.category;
    if(categoryId){
        const questionList = await Question.find({category: categoryId},{title: 1, type: 1});
        if(! questionList.length > 0){
            return res.status(200).render('question/editQuestionList',{path: '/question/editQuestion',});
        }
        let qType = [];
        const qTypeQuestionList = {};
        questionList.forEach(element=>{
            qType.push(element.type);
        })
        qType = _.uniq(qType);
        qType.forEach(element=>{
            qTypeQuestionList[element] = _.filter(questionList,  (val=>{
                return val.type === element;
            })) ; //console.log(qTypeQuestionList[element]);
        })
        return res.status(200).render('question/editQuestionList',{path: '/question/editQuestion', qType, qTypeQuestionList});
    }
    //--------- I am the root -------------> 
    const categoryList = await Category.find({}).sort({
        'slug': 1
    });
    res.status(200).render('editQuestion', {path: '/question/editQuestion', category:categoryList});
}

//editQuestionPost 
module.exports.editQuestionPost= async(req,res,next)=>{
    const questionId = req.query.question;
    const title = req.body.title;
    const category = mongoose.Types.ObjectId(req.body.category);
    const qType = req.body.qType;
    const text = req.body.text;
    let stems = req.body.stems;
    let answers = req.body.answers;
    let feedbacks = req.body.feedbacks;
    const generalFeedbacks = req.body.generalFeedbacks;
    let tags = _.words(req.body.tags);
    let stemErrors = '';

    //console.log(stems, answers, feedbacks);
    if (qType === 'matrix') {
        stemErrors = matrixController.stemChecking(stems, answers, feedbacks);
        answers = _.toArray(answers);
    } else if (qType === 'sba') {
        stemErrors = sbaController.stemChecking(stems, answers, feedbacks);
        answers = _.toArray(answers);
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('error', errors.array()[0].msg);
        return res.redirect(req.originalUrl);
    }
    if (stemErrors.length > 0) {
        req.flash('error', stemErrors);
        return res.redirect(req.originalUrl);
    }
    const stemBody = {
        stems: _.compact(stems),
        answers: _.compact(answers),
        feedbacks: feedbacks
    }

    const isUpdated = await Question.updateOne({_id: questionId},{
        title,category,
        type:qType,
        modifiedDate: Date.now(),
        text,stemBody,generalFeedbacks,tags
    })

    return res.redirect('/question/editQuestion');
}
// delete questionGet

module.exports.deleteQuestionGet = (req,res,next)=>{
    return res.status(200).render('question/deleteQuestion');
}

//delete post

module.exports.deleteQuestionPost = async(req,res,next)=>{
    const questionId = req.query.question;
    await Question.deleteOne({_id: questionId});
    return res.redirect('/question/editQuestion');

}


// function to validate and convert uploaded excel data into a collection 
function toCollection(data, category, user) {
    // const category = category;
    // const user = user; 
    const allData = [];
    const errorIndex = [];
    const errorMessage = [];

    data.forEach((element, index) => {
        let stems = [];
        let answers = [];
        let feedbacks = [];

        //validating inputs
        //title(0),qtype(1),text(2),stem(3-7),ans(8-12),feed(13-17),gf(18),tags(19)
        if (element[0] === '') {
            errorIndex.push(index + 1);
            errorMessage.push('A question Title can not be Empty');
            return;
        }
        if (element[1] === '') {
            errorIndex.push(index + 1);
            errorMessage.push('A question Type can not be Empty');
            return;
        }
        if (element[2] === '') {
            errorIndex.push(index + 1);
            errorMessage.push('A question Text can not be Empty');
            return;
        }
        if (element[3] === '') {
            errorIndex.push(index + 1);
            errorMessage.push('First stem can not be empty.');
            return;
        }
        for (let i = 3; i < 8; i++) {
            if (element[i] === '' && element[i + 10] !== '') {
                errorIndex.push(index + 1);
                errorMessage.push('Feedback Can not be on empty stems.');
                return;
            }
        }
        if (element[1] === 'matrix') {
            for (let i = 3; i < 8; i++) {
                if ((element[i] !== '' && element[i + 5] === '') || (element[i + 5] !== '' && element[i] === '')) {
                    errorIndex.push(index + 1);
                    errorMessage.push('Stem should have corresponding answer and vice versa.')
                    return;
                }
            }
        }

        for (let i = 3; i < 8; i++) {
            if (element[i] !== '') {
                stems.push(element[i])
            }
        }
        for (let i = 8; i < 13; i++) {
            if (element[i] !== '') {
                answers.push(element[i])
            }
        }
        for (let i = 13; i < 18; i++) {
            if (element[i] !== '') {
                feedbacks.push(element[i])
            }
        }
        allData.push({
            title: element[0],
            category,
            creator: user,
            type: element[1],
            text: element[2],
            stemBody: {
                stems: stems,
                answers: answers,
                feedbacks: feedbacks
            },
            generalFeedbacks: element[18],
            tags: _.words(element[19])
        })
    });

    return {
        allData,
        errorIndex,
        errorMessage
    }
}
