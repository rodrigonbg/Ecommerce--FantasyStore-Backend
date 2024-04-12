//Permite acceso solo al admin
function authAdminAccess(req, res, next){
    if (req.session.rol !== 'admin'){
        res.send('Funcionalidad solo para administradoress')
    }else{
        next()
    }
}

//Permite acceso a cualqiuiera que no sea admin
function authNotAdminAccess(req, res, next){
    if (req.session.rol !== 'admin'){
        next()
    }else{
        res.send('Funcionalidad solo para administradoress')
    }
}

//Permite acceso solo al usuario
function authUserAccess(req, res, next){
    if (req.session.rol !== 'usuario'){
        res.send('Funcionalidad solo para usuarios no administradoress')
    }else{
        next()
    }
}

//Permite acceso a cualquiera que no sea usuario
function authNotUserAccess(req, res, next){
    if (req.session.rol !== 'usuario'){
        next()
    }else{
        res.send('Funcionalidad solo para usuarios no administradoress')
    }
}

//Permite acceso solo si se está logueado, y si no, redirecciona
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
    authNotAdminAccess,
    authNotUserAccess,
    isLoged
};