//Permite acceso solo al admin
function authAdminAccess(req, res, next){
    if (req.user.rol !== 'admin'){
        res.send('Funcionalidad solo para administradoress')
    }else{
        next()
    }
}

//Permite acceso a cualqiuiera que no sea admin
function authNotAdminAccess(req, res, next){
    if (req.user.rol !== 'admin'){
        next()
    }else{
        res.send('Funcionalidad solo para administradoress')
    }
}

//Permite acceso solo al usuario
function authUserAccess(req, res, next){
    if (req.user.rol !== 'usuario'){
        res.send('Funcionalidad solo para rol usuario')
    }else{
        next()
    }
}

//Permite acceso solo aluser premium
function authPremiumAccess(req, res, next){
    if (req.user.rol !== 'premium'){
        res.send('Funcionalidad solo para rol premium')
    }else{
        next()
    }
}

//Permite acceso a cualquiera que no sea usuario
function authNotUserAccess(req, res, next){
    if (req.user.rol !== 'usuario'){
        next()
    }else{
        res.send('Funcionalidad solo para rol no usuarios')
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

//Permite acceso solo si no se está logueado, y si no, redirecciona
function isNotLoged(req, res, next, redirect='/loginForm'){
    if(!req.session.login){
        next();
    }else{
        res.send('Ya estás logueado')
    }
}

module.exports = {
    authAdminAccess,
    authUserAccess,
    authPremiumAccess,
    authNotAdminAccess,
    authNotUserAccess,
    isLoged,
    isNotLoged
};