
function authAdminAccess(req, res, next){
    if (req.session.rol !== 'admin'){
        res.send('Funcionalidad solo para administradoress')
    }else{
        next()
    }
}

function authUserAccess(req, res, next){
    if (req.session.rol !== 'usuario'){
        res.send('Funcionalidad solo para usuarios no administradoress')
    }else{
        next()
    }
}

function isLoged(req, res, next, redirect='/loginForm'){
    if(req.session.login){
        next();
    }else{
        res.redirect(redirect)
    }
}

module.exports = {
    authAdminAccess,
    authUserAccess,
    isLoged
};