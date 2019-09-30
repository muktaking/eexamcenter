const {checkSchema,check} = require('express-validator/check');
const mongoose = require('mongoose');
const _ = require('lodash');
// module.exports.extractAsObj = (name,pattern)=>{
//     return (req,res,next)=>{
//         const result = {};

//         _.forIn(req.body, function(value, key) {
//             if(pattern.test(key) && value.length > 0){
//                 result[key.split('_')[1]] = _.chain(value).toString().trim().escape().escapeRegExp().value();
//             }
//         });

//         if(!_.isEmpty(result)){
//             req.body[name] = result;
//         } 
//         return next();
//     }  

// }
module.exports.extractAsArray = (name,pattern)=>{
    return (req,res,next)=>{
        const result = [];

        _.forIn(req.body, function(value, key) {
            if(pattern.test(key)){
                result.push(value);
            }
        });
        req.body[name] = result;
        return next();
    }  

}

module.exports.extractAsObj = (name,pattern)=>{
    return (req,res,next)=>{
        if(req.body.qType === 'sba'){
            return next();
        }
        const result = {};

        _.forIn(req.body, function(value, key) {
            if(pattern.test(key)){
                result[key.split('_')[1]] = value;
            }
        });
        req.body[name] = result;
        return next();
    }  

}

module.exports.questionValidation = checkSchema({
    title: {
        in: ['body'],
        errorMessage: 'Please Give a Valid Question Title',
        isString: true,
        toString: true,
        trim: true,
        escape: true,
        isLength: {
            errorMessage: 'Title Should not be empty or too long',
            options: {min:1,max:200}
        }
    },
    category: {
        in: ['body'],
        errorMessage: 'Please Give a Category',
        isString: true,
        toString: true,
        trim: true,
        escape: true,
        isLength: {
            errorMessage: 'Category Should not be empty or too long',
            options: {min:1,max:100}
        }
    },
    qType: {
        in: ['body'],
        errorMessage: 'Choose question Type',
        isString: true,
        toString: true,
        trim: true,
        escape: true,
        isLength: {
            errorMessage: 'question Should not be empty or too long',
            options: {min:1,max:100}
        }
    },
    text: {
        in: ['body'],
        errorMessage: 'Please Write a Valid Question',
        isString: true,
        toString: true,
        trim: true,
        escape: true,
        isLength: {
            errorMessage: 'Question text Should not be empty or too long',
            options: {min:1,max:300}
        }
    },
    stems: {
        in: ['body'],
        errorMessage: 'Please Write a Valid Stem Text',
        //isString: true,
        toString: true,
        trim: true,
        escape: true,
        isLength: {
            errorMessage: 'Stems should not be too long',
            options: {max:200}
        }
    },
    answers: {
        in: ['body'],
        errorMessage: 'Please Write a Stem answer',
        //isString: true,
        toString: true,
        trim: true,
        escape: true,
        isLength: {
            errorMessage: 'Stems should not be too long',
            options: {max:200}
        }
    }, 
    feedbacks: {
        in: ['body'],
        errorMessage: 'Please Write a feedback',
        //isString: true,
        toString: true,
        trim: true,
        escape: true,
        isLength: {
            errorMessage: 'Stems should not be too long',
            options: {max:200}
        }
    },   
    generalFeedbacks: {
        in: ['body'],
        errorMessage: 'Please Write a Valid generalFeedbacks',
        isString: true,
        toString: true,
        trim: true,
        escape: true,
        isLength: {
            errorMessage: 'GeneralFeedback is too long',
            options: {max:300}
        }
    },
    tags: {
        in: ['body'],
        errorMessage: 'Please Write a Valid generalFeedbacks',
        isString: true,
        toString: true,
        trim: true,
        escape: true,
        isLength: {
            errorMessage: 'Tags text is too long',
            options: {max:200}
        }
    }
});

//category validation
module.exports.categoryValidation = checkSchema({
    catName: {
        in: ['body'],
        errorMessage: 'Please choose a valid category name with alphanumeric value with max 20 and min 1 character',
        trim: true,
        isLength: {
            options:{
                min: 1,
                max: 20
            }
        },
        custom: {
            options: (value,{req})=>{
            //checking category name is alphanumeric; space or - is allowed only one time and in between words 
                let regex = /^([\w]+[\s|-]?)+[\w]+$/;
                const isMatch = regex.test(value);
                if (!isMatch) {
                    throw new Error('Please choose a valid category name with alphanumeric value with max 20 and min 1 character');
                }
                return true;
            }
        }
    
    },
    catDescribe:{
        in: ['body'],
        errorMessage: 'Say something about your Category',
        trim: true,
        escape: true,
        isLength:{
            options:{
                min: 10,
                max: 500
            }
        }
    }
    ,
    parentCat:{
        in: ['body'],
        trim: true,
        custom: {
            options: async (value,{req})=>{
                if (req.body.parentCat === 'Top') {
                    return true;
                }
                try {
                    const isMatch = await mongoose.model('Category').find({
                        _id: req.body.parentCat
                    })
                    if (!isMatch) {
                        throw new Error('Parent Category is not Matched');
                    }
                    return true;
                } catch (error) {
                    console.log(error);
                    throw new Error('Something is wrong');
                    
                }
            }
        }
    },
    
    id: {
        in: ['params'],
        optional: {nullable: true},
        errorMessage: 'Category is invalid',
        isMongoId: true,
        escape: true,
    }


})

module.exports.examValidation = checkSchema({
    'questionList.*.id': {
        in: ['body'],
        errorMessage: 'Question id is not in well format',
        isMongoId: true
    },
    'questionList.*.answers.*': {
        in: ['body'],
        errorMessage: 'Question Answer is not in well format',
        isAlphanumeric: true
    },
    'questionList.*.state': {
        in: ['body'],
        errorMessage: 'Question state is not in well format',
        isBoolean: true
    },
    'questionList.*.type': {
        in: ['body'],
        errorMessage: 'Question type is not in well format',
        isIn:{
            options: [['matrix', 'sba']]
        }
    },

})