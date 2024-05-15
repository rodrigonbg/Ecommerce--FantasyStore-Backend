const UserRepository = require("../repositories/user.repository.js");
const userRepository = new UserRepository();

const generateToken =  require('../utils/resetPassToken.js');
const {sendRecoveryPassMail} = require('../services/emailsManager.js');
const {isValidPassword} = require('../utils/hashBcrypt.js');

class userController{

    //ruta ¨/failedRegister¨, metodo GET
    async failRegister (req,res){
        res.send({error: 'registro fallido'})
    }

    //ruta ¨/requestPasswordReset¨, metodo POST
    async requestPasswordResetEmail(req,res){
        try {
            const email = req.body.email;
            if (!email) {
                return res.status(400).send({ message: 'Email is required' });
            }

            const user = await userRepository.getUserbyEmail(email);
            if (!user) {
                return res.status(404).send({ message: 'No se obtiene un usuario al cual enviarle el correo de recuperacion' });
            }

            const token = generateToken();
            await userRepository.saveTokenInUser(user, token)
                
            await sendRecoveryPassMail(email, user.first_name, token)
                .then(()=> res.render('confirmacionDeEnvio'))
                
        } catch (error) {
            req.logger.error('error al enviar mail de recuepracion.', error)
            res.send(error)
        }
    }

    //ruta ¨/passwordReset¨, metodo POST
    async passwordReset(req,res){
        try {
            const {email, token, password} = req.body;

            const user = await userRepository.getUserbyEmail(email);
            if(!user){
                throw `No existe un usuario con ese email.`
            }

            if((user.resetToken.token !== token) || (user.resetToken.exipresAt < new Date())){ //expirtesAt < date now tambien cero
                throw `Token invalido.`
            }
   
            if (isValidPassword(password, user)){
                throw `No se puede ingresar la misma contraseña.`
            }

            await userRepository.changeUserPass(user, password)
                .then(()=> res.redirect('/loginForm'))

        } catch (error) {
            req.logger.error('error al resetaear la contraseña.', error)
            res.send(error)
        }

    }
}

module.exports = userController;