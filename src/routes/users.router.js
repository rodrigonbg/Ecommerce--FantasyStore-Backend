const express = require("express");
const router = express.Router();

const passport = require("passport");

//Sessions Controller
const SessionsController = require('../controller/sessionsController.js');
const sessionsController = new SessionsController();

//User Controller
const UserController = require('../controller/userController.js');
const userController = new UserController();

//Midlewares
const {handleErrorCrearProducto, handleErrorCrearUser, handleErrorAgregarACarrito} =require('../middleware/handleErrors.js')
const {authAdminAccess, authNotAdminAccess, authNotUserAccess, authUserAccess,authPremiumAccess, isLoged} = require('../middleware/profileAccess.js')

//Multer
const {uploaderDocs, uploaderProds} = require('../middleware/multer.js')
const fileds = [{ name: 'document', maxCount: 1 },{ name: 'homeBill', maxCount: 1 },{ name: 'bankBill', maxCount: 1 }]

// Aplicar bodyParser antes de Multer si es necesario
const bodyParser = require('body-parser');
router.use(bodyParser.json());

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
