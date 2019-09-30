const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CategorySchema = new Schema({
    parentId: {
        type: mongoose.SchemaTypes.ObjectId
    },
    name: {
        type: String,
        required: true
    },
     slug: {
         type: String,
         required: true
     },
     catDescribe:{
         type:String,
         required: true,
         maxlength: 300
     },
     imageUrl: String,
     
     order: {
         type: Number,
     }
})

module.exports = mongoose.model('Category',CategorySchema);