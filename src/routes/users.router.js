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
//Multer
const uploader = require('../middleware/multer.js')

//////PASSPORT///////////
//Registro con el middleware de passport y luego hago el login
router.post('/', handleErrorCrearUser, passport.authenticate('register', {failureRedirect: '/api/users/failedRegister'}), sessionsController.login)
router.get('/failedRegister', userController.failRegister)

//Enviar mail para resetear contraseña
router.post('/requestPasswordReset', userController.requestPasswordResetEmail)

//obtener todos los ususarios
router.get('/', userController.getUsers)

//Cambiar contraseña con token
router.post('/passwordReset', userController.passwordReset)

//Cambiar rol de user a premium y viseversa
router.get('/premium/:uid', userController.changeUserRol)

//Subir documentos de los usuarios
router.post('/:uid/documents', uploader.single('document'), uploader.single('homeBill'), uploader.single('bankBill'), userController.addDocuments)

module.exports = router;
