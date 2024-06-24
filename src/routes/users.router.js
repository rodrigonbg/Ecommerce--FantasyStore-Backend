const express = require("express");
const router = express.Router();
const passport = require("passport");
const SessionsController = require('../controller/sessionsController.js');
const sessionsController = new SessionsController();
const UserController = require('../controller/userController.js');
const userController = new UserController();

//Midlewares
const {handleErrorCrearUser} =require('../middleware/handleErrors.js')
const {authAdminAccess, isLoged} = require('../middleware/profileAccess.js')
const {uploaderDocs} = require('../middleware/multer.js')
const fileds = [{ name: 'document', maxCount: 1 },{ name: 'homeBill', maxCount: 1 },{ name: 'bankBill', maxCount: 1 }]

//////PASSPORT///////////
//Registro con el middleware de passport y luego hago el login
router.post('/front', handleErrorCrearUser, passport.authenticate('register', {failureRedirect: '/api/users/failedRegister'}), sessionsController.loginFront)
router.post('/', handleErrorCrearUser, passport.authenticate('register', {failureRedirect: '/api/users/failedRegister'}), sessionsController.login)
router.get('/failedRegister', userController.failRegister)

//Enviar mail para resetear contraseña
router.post('/requestPasswordReset', userController.requestPasswordResetEmail)

//obtener todos los ususarios
router.get('/', userController.getUsers);

//eliminar usuario por id
router.delete('/:uid', userController.deleteUserById);

//eliminar usuarios inactivos
router.delete('/',isLoged, authAdminAccess, userController.deleteInactiveUsers);

//Cambiar contraseña con token
router.post('/passwordReset', userController.passwordReset)

//Cambiar rol de user a premium y viseversa
router.get('/premium/:uid', userController.changeUserRol)

//Subir documentos de los usuarios
router.post('/:uid/documents', uploaderDocs.fields(fileds), userController.addDocuments)

module.exports = router;
