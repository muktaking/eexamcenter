const mongoose = require('mongoose');

const ExamSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    exams:[{
        _id:{//can be categoryId or examSetId
            type: mongoose.Types.ObjectId,
            required: true
        },
        attemptNumbers:{
            type: Number,
            default: 1
        },
        averageScore:{
            type: Number,
            set: function(v) {
                return Number(( this.averageScore + Number((v/this.attemptNumbers).toFixed(2)) ).toFixed(2));
            },
            default: 0
        },
        firstAttemptTime:{
            type: Date,
            default: Date.now
        },
        lastAttemptTime:{
            type: Date,
            default: Date.now
        },
        submitStatus:{
            type: Boolean,
            default: false
        }

    }]

})

module.exports = mongoose.model('Exam',ExamSchema);