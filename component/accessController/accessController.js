const createError = require('http-errors');
const isAuth = require('../utils/isAuth');
const appRoot = require('app-root-path');

const logger = require(appRoot+'/config/winston');
//importing routes
const indexRouter = require('../index/indexController'); // router and controller is same for index
const searchRouter = require('../search/searchController'); // router and controller is same for index
const staticRouter = require('../static/staticController');
const userRouter = require('../user/userRoute');
const dbRouter = require('../dashboard/dbRoute');
const categoryRouter = require('../category/categoryRoute');
const questionRouter = require('../question/questionRoute');
const examRouter = require('../exam/examRoute');
//breadcrumbs
const breadcrumbs = require('../utils/breadcrumbs').breadcrumbs;

const startup = (app)=>{
    //admin level restriction
    app.use('/category', isAuth.restrictByRole('admin'), categoryRouter);
    app.use('/question', isAuth.restrictByRole('mentor'),questionRouter)
    //low level restriction
    app.use('/dashboard', isAuth.restrictByRole('member'), dbRouter)
    app.use('/exam', breadcrumbs('Exam', '/exam'), examRouter);
    //no restriction
    //setting routes
    app.get('/search', breadcrumbs('Search', '/search'),searchRouter.getSearch)
    app.use('/user', breadcrumbs('User', '/user'),userRouter);
    app.get('/help', breadcrumbs('Help', '/help'),staticRouter.getHelp);
    app.get('/about-us', breadcrumbs('About us', '/about-us'),staticRouter.getAboutUs);
    app.use('/', indexRouter);
    app.get('*', function(req, res, next) {
        return next(createError(404, 'Sorry, No Content Found.'));
    });
    //error handling
    app.use(function(err, req, res, next) {
        logger.log('error', err.message, err);
        console.error(err); // Log error message in our server's console
        if (!err.statusCode) err.statusCode = 500; // If err has no specified error code, set error code to 'Internal Server Error (500)'
        return res.status(err.statusCode).render('error',{
            err,
            //seo
            title: `Error: Sorry some error occur`,
            description: `We are very sorry for this error. Please inform us for this error` ,
            keywords: 'online, medical, post graduation, residency, fcps, frcs, MD, MS, Exam'
        
        }); // All HTTP requests must have a response, so let's send back an error with its status code and message
      });
}

module.exports = startup;