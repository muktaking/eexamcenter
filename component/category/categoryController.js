const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const {
    validationResult
} = require('express-validator/check'); // validating sign up, login data
const createError = require('http-errors');

//importing model
const CategoryModel = require('./categoryModel');
const QuestionModel = require('../question/questionModel.js');

//controller of category page for creation in case of admin 
module.exports.getCategory = async (req, res, next) => {
    // flash message form redirected page
    let msg = req.flash('error');
    if (msg.length > 0) {
        msg = msg[0];
    } else {
        msg = null
    }

    // try to catch server error
    try {
        const category = await CategoryModel.find({}).sort({
            'slug': 1
        }); // fetch data with name property and sort by name in ascending order
        if (!category) { // if no category present
            return res.status(200).render('category/addCategory',{
                path: '/category'
            });
        }
        //function to storing category according to their hierarchy
        let catHierarchy = [];
        category.forEach((element, index, arr) => {
            let child = arr.filter(e => element._id.equals(e.parentId)); //store child into parent
            if (child.length > 0) {
                element.child = child;
            }
            if (element.parentId === null) {
                catHierarchy.push(element);
            }
        })
        res.status(200).render('category/addCategory', {
            path: '/category',
            category,
            catHierarchy,
            errorMessage: msg
        });
    } catch (error) {
        console.log(error);
        return next(createError(500, 'Sorry, server side error occurred'));
    }

}

// controller for creating a category
module.exports.PostCategory = async (req, res, next) => {
    let slug;
    let catName = req.body.catName; // category name
    let parentId = req.body.parentCat === 'Top' ? null : req.body.parentCat ; // parent category Id
    let order = req.body.order !== '' ? +req.body.order : 100;
    let catDescribe = req.body.catDescribe;
    const image = req.files.image ? req.files.image[0] : null;


    if(!image){
        req.flash('error', 'Attach file is not an image');
        return res.redirect('/category');        
    }
    const imageUrl = '/'+ image.path;

    const errors = validationResult(req); // getting validation error
    // check if any validation error present
    if (!errors.isEmpty()) {
        console.log(errors.array());
        req.flash('error', errors.array()[0].msg, )
        return res.redirect('/category')
    }

    try {       
        const [matchCategory] = await CategoryModel.find({
            name: catName,
            parentId: parentId
        });
        if (matchCategory) {
            req.flash('error', 'Category already Present under same level');
            return res.redirect('/category');
        }
        
        let [parentCategory] = await CategoryModel.find({
            _id: parentId
        }); 
        slug = parentId ? parentCategory.slug : 'Top';
        slug = slug + ' / ' + catName
        //create a new category and save in db
        let category = new CategoryModel({
            name: catName,
            parentId,
            order,
            slug,
            catDescribe,
            imageUrl
        });

        try {

            let result = await category.save();
            return res.redirect('/category');

        } catch {
            console.log(error);
            return next(createError(500, 'Sorry, server side error occurred'));
            
        }


    } catch (error) {
        console.log(error);
        return next(createError(500, 'Sorry, server side error occurred'));
        
    }

}

// editCategory get request controller
module.exports.editCategoryGet = async (req, res, next) => {
    const catId = req.params.id; // extracting the category's id  

    let msg = req.flash('error');
    if (msg.length > 0) {
        msg = msg[0];
    } else {
        msg = null
    }

    try {
        const [cat] = await CategoryModel.find({ // cat = the category to be edited 
            _id: catId
        });
        if (cat) {
            const category = await CategoryModel.find({$and: [{_id: {$ne: catId}},{parentId: {$ne: catId}}]}).sort({slug: 1});
            res.status(200).render('category/editCategory', {
                category,
                cat,
                errorMessage: msg
            })
        }
    } catch (error) {
        console.log(error);
    }

}

//edit category post request controller
module.exports.editCategoryPost = async (req, res, next) => {
    const catId = req.params.id;
    let newCatSlug;
    const editedCatName = req.body.catName;
    const catDescribe = req.body.catDescribe;
    const image = req.files['image'];
    const parentId = req.body.parentCat !== 'Top' ? req.body.parentCat : null;
    const errors = validationResult(req); // getting validation error
    // check if any validation error present
    if (!errors.isEmpty()) {
        console.log(errors.array());
        req.flash('error', errors.array()[0].msg, )
        return res.redirect('category/editCategory/'+ catId)
    }    
    try {
        const [oldCat] = await CategoryModel.find({_id: catId});
        if(!_.isEqual(oldCat.parentId, parentId)){
            const [matchCategory] = await CategoryModel.find({
                name: editedCatName,
                parentId: parentId
            });
            if (matchCategory) {
                req.flash('error', 'Category already Present under same level');
                return res.redirect('/category/editCategory/' + catId);
            }
        }
        let childCategory = await CategoryModel.find({$or: [{_id: catId},{parentId: catId}]}).sort({slug: 1});
        let NewParentCat;
        if(parentId){
            [NewParentCat] = await CategoryModel.find({_id: parentId});
        }
        if(childCategory){
            childCategory.forEach((element)=>{
                if(element._id.equals(catId)){
                    element.name = editedCatName;
                    element.catDescribe = catDescribe;
                    if(image){
                        element.imageUrl = '/'+ image.path; 
                    }
                    if(req.body.order !== ''){
                        element.order = +req.body.order;
                    }
                    element.parentId = parentId !== 'Top' ? parentId : null;
                    newCatSlug = element.slug = parentId  ?  NewParentCat.slug + ' / ' + editedCatName : 'Top / ' + editedCatName;
                    
                    return;
                }

                element.slug = newCatSlug + element.slug.split(oldCat.name)[1];
            })
            try{
                childCategory.forEach(async(element)=>{
                    await element.save();
                })
                
                return res.redirect('/category');

            } catch(error){
                console.log(error);
                return next(createError(500, 'Sorry, server side error occurred'));
            }
        }
    } catch (error) {
        console.log(error)
    }

}

//delete category get request

module.exports.deleteCategoryGet = (req,res,next)=>{
    const catId = req.params.id;
    res.status(200).render('category/deleteCategory', {catId});
}

//delete category post request controller

module.exports.deleteCategoryPost = async (req,res,next)=>{
    const catId = req.params.id;

    try {
        const [catToDelete] = await Category.find({_id: catId});
        if(catToDelete){
            const childCats = await CategoryModel.find({parentId: catId});
            childCats.forEach( async(element)=>{
                element.parentId = catToDelete.parentId;
                element.slug = element.slug.replace( '/ '+catToDelete.name+' /', '/' );
                try {
                    await element.save();
                } catch (error) {
                    console.log(error);
                }
            });
            image = path.dirname(require.main.filename) + catToDelete.imageUrl;
            fs.unlink(image, (err) => {
                if (err) {
                    console.log(err);
                }
                console.log( image + 'was deleted');
              });
            try {
                await Category.deleteOne({_id: catId});
                //
                const haveAnyQuestion = await QuestionModel.findOne({category: catId});
                if(haveAnyQuestion){
                    if(catToDelete.parentId === null){
                        let [checkOthers] = await Category.find({name: 'Others', parentId: null});
                        if(!checkOthers){
                            checkOthers = new Category({
                                name: 'Others',
                                parentId: null,
                                slug: 'Top / Others',
                                order: 10000,
                                catDescribe: 'All other non-categorized topics'
                            })
                            checkOthers = await checkOthers.save();    
                        }
                        await QuestionModel.updateMany({category: catId},{$set:{category: checkOthers._id}});
                        return res.redirect('/category');
                    }
                    await Question.updateMany({category: catId},{$set:{category: catToDelete.parentId}});
                    return res.redirect('/category');

                }
                
                //
                return res.redirect('/category');
            } catch (error) {
                console.log(error);
                next(error);
            }
            
        }
        else{
            return res.redirect('/category');
        }
        // question category manipulation will goes here
        // update question category with its parent id
        //const questionList = await Question
        
    } catch(error){
        console.log(error);
    }


}