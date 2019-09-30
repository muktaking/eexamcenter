const createError = require('http-errors');

module.exports.isLoggedIn = (req,res,next)=>{
    if(req.session.isLoggedIn){
        next()
    } else{
        res.redirect('/user/login');
    }
}

module.exports.isAdmin = (req,res,next)=>{
    if(req.session.user ? req.session.user.role === 'admin' : false){
        next();
    } else{
        return next(createError(403, 'Forbidden Access.'))
    }
}

module.exports.restrictByRole = (role)=> {

    return (req,res,next)=>{
        userRole = req.session.user ? req.session.user.role : null
        if(roleValue(userRole) <= roleValue(role)){
            next()
        } else{
            return next(createError(401, 'Unauthorized Access! please login'));
        }
    }
}

const roleValue = (role)=>{
    switch(role){
        case 'admin':
            value = 0;
            break;
        case 'moderator':
            value = 1;
            break;
        case 'mentor':
            value = 2;
            break;
        case 'member':
            value = 3;
            break;
        default:
            value = 10000;            
    }
    return value;
}