const express = require("express");
const router = express.Router();
const ViewsController = require('../controller/viewsController.js');
const viewsController = new ViewsController();

const {authAdminAccess, authPremiumAccess, isLoged} = require('../middleware/profileAccess.js')

//ROUTING

/* ----------------------------------------GETs----------------------------------------------- */
//Vista de los productos
router.get("/", viewsController.renderProducts)

//Ver usuario conectado
router.get('/user', isLoged, viewsController.renderConectedUser)

//Ver usuario por id (admin)
router.get('/user/:uid', isLoged, authAdminAccess, viewsController.renderUserById)

 //Vista de los carritos
router.get("/carts", isLoged, authAdminAccess, viewsController.renderCarts)

//Viste de un carrto
router.get("/carts/:cid", isLoged, viewsController.renderCart)

//Vista de productos en tiempo real
router.get("/admin", isLoged, authAdminAccess, viewsController.renderRealTimeProducts)
router.get("/premiumProducts", isLoged, authPremiumAccess, viewsController.renderPremiumProducts)

//Vista de login (iniciar sesion)
router.get("/loginForm", viewsController.renderLoginForm)

//Vista de singin (registrarse)
router.get("/singinForm", viewsController.renderSinginForm)

//Vista de solicitud de restablecimiento de contraseña
router.get("/reset-password", viewsController.renderResetPassword)

//Vista de solicitud de restablecimiento de contraseña
router.get("/password", viewsController.renderNewPasswordForm)

//Vista de solicitud de carga de docuementos 
router.get('/documents', isLoged, viewsController.renderAddDocumentsForm)

module.exports = router;