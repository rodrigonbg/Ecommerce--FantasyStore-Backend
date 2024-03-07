const express = require("express");
const router = express.Router();
const UserModel = require('../models/user.models')
const {isValidPassword} = require ('../utils/hashBcrypt');
const passport = require("passport");

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
router.get('/logout', async (req, res)=>{
    if (req.session.login) { 
        req.session.destroy() //Destruir la session actual
        res.status(200).redirect('/')
    }
})

/////PASSPORT/////////

//local
router.post('/login',
    passport.authenticate('login', {failureRedirect : '/api/sessions/failLogin'}),
    async (req, res)=>{
        if(!req.user) return res.status(400).send({status: 'error', message: 'Credenciales invalidas'})
        req.session.user = {
            first_name : req.user.first_name,
            last_name : req.user.last_name,
            age : req.user.age,
            email : req.user.email,
        };
        (req.user.email === "admincoder@coder.com")? req.session.rol = 'admin' :  req.session.rol = 'usuario';
        req.session.login = true;
        res.status(200).redirect('/')
    }
)

router.get('/failLogin', (req,res)=> {
    res.send({error: 'fallo de la estrategia'})
    }
)

//github
router.get('/github', passport.authenticate('github', {scope : ['user:email']}), async (req, res)=>{})

router.get('/githubcallback', passport.authenticate('github', {failureRedirect : '/loginForm'}), async (req, res)=>{
    req.session.user = req.user;
    req.session.login = true;
    res.redirect('/')
})

module.exports = router;