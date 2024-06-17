const configObject = require('../config/dotenv.config.js')

class sessionsController{

    //ruta ¨/logout¨, metodo GET
    async logout (req, res){
        if (req.session.login) { 
            req.session.destroy() //Destruir la session actual
            return res.status(200).redirect('/')
        }
        return res.status(400).redirect('/')
    }
    //ruta ¨/logoutFront¨, metodo GET
    async logoutFront (req, res){
        if (req.session.login) { 
            req.session.destroy() //Destruir la session actual
            return res.status(200).send('session cerrada')
        }
        return res.status(400).send('no habia una session')
    }
    
    //ruta ¨/login¨, metodo POST como local para passport
    async login (req, res){
        if(!req.user) return res.status(400).send({status: 'error', message: 'Credenciales invalidas'})
        req.session.login = true;
        req.logger.info('Sesion iniciada con local passport')
        return res.status(200).redirect('/')
    }

    //ruta ¨/loginFront¨, metodo POST como local para passport desde el fornt
    async loginFront (req, res){
        if(!req.user) return res.status(400).send({status: 'error', message: 'Credenciales invalidas'})
        req.session.login = true;
        req.logger.info('Sesion iniciada con local passport desde el front')
        return res.status(200).send(req.user)
    }

    //ruta ¨/failLogin¨, metodo GET
    async failLogin (req, res){
        res.send({error: 'error al iniciar sesion'})
    }

    //ruta ¨/github¨, metodo GET con github-passport
    async github (req, res){
       
    }

    //ruta ¨/githubcallback¨, metodo GET con github-passport
    async githubcallback (req, res){
        req.session.user = req.user;
        req.session.login = true;
        req.logger.info('Sesion iniciada con github')
        res.redirect('/')
    }
}

module.exports = sessionsController;