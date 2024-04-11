const express = require("express");
const router = express.Router();

//Views Controller
const ViewsController = require('../controller/viewsController.js');
const viewsController = new ViewsController();

const {authAdminAccess, authUserAccess, isLoged} = require('../middleware/profileAccess.js')

//ROUTING

/* ----------------------------------------GETs----------------------------------------------- */
//Vista de los productos
router.get("/", viewsController.renderProducts)

//Ver usuario conectado
router.get('/user', isLoged, viewsController.renderConectedUser)

 //Vista de los carritos
router.get("/carts", isLoged, authUserAccess, viewsController.renderCarts)

//Viste de un carrto
router.get("/carts/:cid", isLoged, authUserAccess, viewsController.renderCart)

//Vista de productos en tiempo real
router.get("/admin", isLoged, authAdminAccess, viewsController.renderRealTimeProducts)

//Vista de login (iniciar sesion)
router.get("/loginForm", viewsController.renderLoginForm)

//Vista de singin (registrarse)
router.get("/singinForm", viewsController.renderSinginForm)

module.exports = router;