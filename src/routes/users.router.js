const express = require("express");
const router = express.Router();
const UserModel = require('../models/user.models');
const { createHash } = require('../utils/hashBcrypt');
const passport = require("passport");

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
router.post('/', 
    passport.authenticate('register', {failureRedirect: '/failedRegister'}), 
    async (req,res)=>{
        if(!req.user) return res.status(400).send({status: 'error', message: 'Credenciales invalidas'})
        req.session.user = {
            first_name : req.user.first_name,
            last_name : req.user.last_name,
            age : req.user.age,
            email : req.user.email,
        };
        req.session.login = true;
        res.status(200).redirect('/')
    }
)

router.get('/failedRegister', (req,res)=> {
    res.send({error: 'registro fallido'})
})


module.exports = router;