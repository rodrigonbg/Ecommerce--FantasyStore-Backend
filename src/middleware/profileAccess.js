//Permite acceso solo al admin
function authAdminAccess(req, res, next){
    try {

        if (req.user.rol !== 'admin'){
            return res.status(403).send({status:403, message: 'Funcionalidad solo para administradoress'})
        }
        next()

    } catch (error) {
        return error
    }
}

//Permite acceso a cualqiuiera que no sea admin
function authNotAdminAccess(req, res, next){
    try {

        if (req.user.rol !== 'admin'){
            next()
        }
        return res.status(403).send({status:403, message: 'Funcionalidad solo para administradoress'})

    } catch (error) {
        return error
    }
}

//Permite acceso solo al usuario
function authUserAccess(req, res, next){
    try {

        if (req.user.rol !== 'usuario'){
            return res.status(403).send({status:403, message: 'Funcionalidad solo para rol usuario'})
        }
        next()
        
    } catch (error) {
        return error
    }

}

//Permite acceso solo aluser premium
function authPremiumAccess(req, res, next){
    try {
        
        if (req.user.rol !== 'premium'){
            return res.status(403).send({status:403, message: 'Funcionalidad solo para rol premium'})
        }
        next()

    } catch (error) {
        return error
    }

}

//Permite acceso a cualquiera que no sea usuario
function authNotUserAccess(req, res, next){
    try {

        if (req.user.rol !== 'usuario'){
            next()
        }
        return res.status(403).send({status:403, message: 'Funcionalidad solo para rol no usuarios'})
        
    } catch (error) {
        return error
    }

}

//Permite acceso solo si se está logueado, y si no, redirecciona
function isLoged(req, res, next, redirect='/loginForm'){
    try {
        
        if(req.session.login){
           return next();
        }
        res.status(401).redirect(redirect)
        
    } catch (error) {
        return error
    }

}

//Permite acceso solo si no se está logueado
function isNotLoged(req, res, next){
    try {

        if(!req.session.login){
            next();
        }
        res.status(401).send({status:401, message:'Se requiere no estar logueado para acceder a este sector.'})
        
    } catch (error) {
        return error
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