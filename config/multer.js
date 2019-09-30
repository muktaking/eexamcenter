const appRoot = require('app-root-path');
const multer = require('multer');

//configuring multer
const fileStorage = multer.diskStorage({
    destination: (req,file, cb) => {
        if(/.*image.*/.test(file.mimetype)){
            cb(null, 'assets/images')
        }
        else{
            cb(null,'assets/fileData');
        }
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString().replace(/[:<>*?/\|]/g,'-') + '_' + file.originalname);
    },
})
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    } 
    else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        cb(null, true);
    }
    else{
        cb(null, false);
    }
}

const multerFunc = (app)=>{
    app.use(multer({
        storage: fileStorage,
        fileFilter: fileFilter
    }).fields([{
        name: 'image',
        maxCount: 1
    },{
        name: 'excel',
        maxCount: 1
    }]));
}

module.exports = multerFunc;