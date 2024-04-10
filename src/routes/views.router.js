const express = require("express");
const router = express.Router();

//Views Controller
const ViewsController = require('../controller/viewsController.js');
const viewsController = new ViewsController();


//ROUTING

/* ----------------------------------------GETs----------------------------------------------- */
//Vista de los productos
router.get("/", viewsController.renderProducts)

//Ver usuario conectado
router.get('/user', viewsController.renderConectedUser)

 //Vista de los carritos
router.get("/carts", viewsController.renderCarts)

//Viste de un carrto
router.get("/carts/:cid", viewsController.renderCart)

//Vista de productos en tiempo real
router.get("/admin", viewsController.renderRealTimeProducts)

//Vista de login (iniciar sesion)
router.get("/loginForm", viewsController.renderLoginForm)

//Vista de singin (registrarse)
router.get("/singinForm", viewsController.renderSinginForm)

module.exports = router;