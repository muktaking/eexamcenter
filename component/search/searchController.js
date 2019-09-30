const _ = require('lodash');
//importing model
const QuestionModel = require('../question/questionModel');

module.exports.getSearch = async(req,res,next)=>{
    const breadcrumbs = req.breadcrumbs();
    const searchText = escapeRegex(req.query.searchText);
    let searchResult = await QuestionModel.find({$text: {$search: searchText}},{text:1, category: 1,'stemBody.stems': 1}).limit(5).populate('category');
    if(_.isEmpty(searchResult)){
        return res.status(200).render('search');
    }
    searchResult = _.groupBy(searchResult, 'category._id');
        res.status(200).render('search',{
            searchResult,
            breadcrumbs,
            searchText,
            //seo
            title: `Search: Search your desired topic here`,
            description: `All our content is fully searchable` ,
            keywords: 'online, medical, post graduation, residency, fcps, frcs, MD, MS, Exam'
        });
}


function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};