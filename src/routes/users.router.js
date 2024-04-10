const express = require("express");
const router = express.Router();

const passport = require("passport");

//Sessions Controller
const SessionsController = require('../controller/sessionsController.js');
const sessionsController = new SessionsController();

//User Controller
const UserController = require('../controller/userController.js');
const userController = new UserController();

/* crear un usuario (singin) */
/* router.post('/', async (req,res)=>{
    const {first_name,  last_name, email , password, repeatPass, age} = req.body;

    try {
        if(repeatPass === password){
            const user = await  UserModel.create({ first_name, last_name ,email: email.toLowerCase(), password: createHash(password), age});
            req.session.user = user;
            req.session.login= true;
            (user.email === "admincoder@coder.com")? req.session.rol = 'admin' :  req.session.rol = 'usuario';
    
            res.status(200).redirect('/')
        }else{
            res.send({msg:'Las contraseñas no coinciden.'})
        }

    } catch (err) {
        res.status(400).send({error: `error al crear un nuevo usuario. ${err}`})
    }
}) */

//////PASSPORT///////////

//Registro con el middleware de passport y luego hago el login
router.post('/', passport.authenticate('register', {failureRedirect: '/failedRegister'}), sessionsController.login)
router.get('/failedRegister',userController.failRegister)


module.exports = router;