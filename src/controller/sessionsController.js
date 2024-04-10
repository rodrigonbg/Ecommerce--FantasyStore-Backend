
class sessionsController{

    //ruta ¨/logout¨, metodo GET
    async logout (req, res){
        if (req.session.login) { 
            req.session.destroy() //Destruir la session actual
            res.status(200).redirect('/')
        }
    }
    
    //ruta ¨/login¨, metodo POST como local para passport
    async login (req, res){
        if(!req.user) return res.status(400).send({status: 'error', message: 'Credenciales invalidas'})
        req.session.user = {
            first_name : req.user.first_name,
            last_name : req.user.last_name,
            age : req.user.age,
            email : req.user.email,
        };
        (req.user.email === configObject.admin_email)? req.session.rol = 'admin' :  req.session.rol = 'usuario';
        req.session.login = true;
        res.status(200).redirect('/')
    }

    //ruta ¨/failLogin¨, metodo GET
    async failLogin (req, res){
        res.send({error: 'fallo de la estrategia'})
    }

    //ruta ¨/github¨, metodo GET con github-passport
    async github (req, res){
        
    }

    //ruta ¨/githubcallback¨, metodo GET con github-passport
    async githubcallback (req, res){
        req.session.user = req.user;
        req.session.login = true;
        res.redirect('/')
    }
}

module.exports = sessionsController;