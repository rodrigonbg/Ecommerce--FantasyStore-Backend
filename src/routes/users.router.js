const express = require("express");
const router = express.Router();
const UserModel = require('../models/user.models');

/* crear un usuario (singin) */
router.post('/', async (req,res)=>{
    const {first_name,  last_name, email , password, repeatPass, age} = req.body;

    try {
        if(repeatPass === password){
            const user = await  UserModel.create({ first_name, last_name ,email: email.toLowerCase(), password, age});
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
})

module.exports = router;