//importing important modules
const path = require('path');
const express = require('express');
const app = express();
require('dotenv').config();//adding dotenv- loading environmental variable
require('express-async-errors');//handle async await error
const bodyParser = require('body-parser');
const db = require('./db');// database and connection details
const session = require('express-session'); // session-cookie managing tools
const MongodbStore = require('connect-mongodb-session')(session); // modules storing session to mongodb
const flash = require('connect-flash');
const csurf = require('csurf');
const csurfProtection = csurf();
const helmet = require('helmet');
const compression = require('compression');
const breadcrumbs = require('./component/utils/breadcrumbs');
app.use(breadcrumbs.init());
require('./config/multer')(app);//configure and initiation of multer
const morgan = require('morgan');
const logger = require('./config/winston'); // winston configuration
const accessController = require('./component/accessController/accessController');// top level routes 

//database link

const dbLink = db.url;// our mongodb database link

//handling uncaught promise rejection
process.on('unhandledRejection', ex =>{
    throw ex;
});

// integrating morgan for logging http request
app.use(morgan('combined', { stream: logger.stream.write }));

// Setting template engine, public folders
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets/images', express.static(path.join(__dirname, 'assets/images')));
//helmet
app.use(helmet());
app.use(compression());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: true
}))
    // parse application/json
app.use(bodyParser.json())
// storing session into mongodb
const store = new MongodbStore({
    uri: dbLink,
    collection: 'sessions'
});

//session middleware function to handle session
app.use(session({
    secret: 'Hello why when',
    resave: false,
    saveUninitialized: false,
    store
}));
app.use(flash()); //flash initialization after session
app.use(csurfProtection); // csurf is middled
app.use((req, res, next) => {// local values of app are set
    app.locals.isAuthenticated = req.session.isLoggedIn;
    app.locals.role = req.session.user ? req.session.user.role : null;
    app.locals.csrfToken = req.csrfToken();
    next();
})

// Set Breadcrumbs home information
app.use(breadcrumbs.setHome());

//top level routes
accessController(app);

//connect
db.mongooseConnect(app);