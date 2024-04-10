const express = require("express");
const router = express.Router();

const passport = require("passport");
const configObject = require('../config/dotenv.config.js')

//Sessions Controller
const SessionsController = require('../controller/sessionsController.js');
const sessionsController = new SessionsController();

//Login (iniciar session)
/* router.post('/login', async (req, res)=>{
    const {email, password} = req.body;
    try {
        const user = await UserModel.findOne(({ email: email.toLowerCase()}));

        if(user){
            if (isValidPassword(password, user)) {
                req.session.login = true;
                req.session.user = user;
                (user.email === "admincoder@coder.com")? req.session.rol = 'admin' :  req.session.rol = 'usuario';
                res.status(200).redirect('/')
            }else{
                res.status(401).json({msg:'Contraseña incorrecta'})
            }
        }else{
            res.status(404).send({message: `Usuario no encontrado.`})
        }
    } catch (err) {
        res.status(400).send({error: `error al crear un nuevo usuario. ${err}`})
    }
})
 */


//Logout (cerrar session)
router.get('/logout', sessionsController.logout)

/////PASSPORT/////////

//local
router.post('/login', passport.authenticate('login', {failureRedirect : '/api/sessions/failLogin'}), sessionsController.login)
router.get('/failLogin', sessionsController.failLogin)

//github
router.get('/github', passport.authenticate('github', {scope : ['user:email']}), sessionsController.github)
router.get('/githubcallback', passport.authenticate('github', {failureRedirect : '/loginForm'}), sessionsController.githubcallback)

module.exports = router;