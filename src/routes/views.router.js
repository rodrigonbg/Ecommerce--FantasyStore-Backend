const express = require("express");
const router = express.Router();

//Views Controller
const ViewsController = require('../controller/viewsController.js');
const viewsController = new ViewsController();

const {authAdminAccess, authNotAdminAccess, authNotUserAccess, authUserAccess, isLoged} = require('../middleware/profileAccess.js')

//ROUTING

/* ----------------------------------------GETs----------------------------------------------- */
//Vista de los productos
router.get("/", viewsController.renderProducts)

//Ver usuario conectado
router.get('/user', isLoged, viewsController.renderConectedUser)

 //Vista de los carritos
router.get("/carts", isLoged, authAdminAccess, viewsController.renderCarts)

//Viste de un carrto
router.get("/carts/:cid", isLoged, viewsController.renderCart)

//Vista de productos en tiempo real
router.get("/realTimeProducts", isLoged, authNotUserAccess, viewsController.renderRealTimeProducts)

//Vista de login (iniciar sesion)
router.get("/loginForm", viewsController.renderLoginForm)

//Vista de singin (registrarse)
router.get("/singinForm", viewsController.renderSinginForm)

//Vista de solicitud de restablecimiento de contraseña
router.get("/reset-password", viewsController.renderResetPassword)

//Vista de solicitud de restablecimiento de contraseña
router.get("/password", viewsController.renderNewPasswordForm)

module.exports = router;