const express = require("express");
const router = express.Router();

//Cart Controller
const CartController = require("../controller/cartController.js")
const cartController = new CartController()

//Midlewares
const {authAdminAccess, authUserAccess, isLoged} = require('../middleware/profileAccess.js')
const {handleErrorCrearProducto, handleErrorCrearUser, handleErrorAgregarACarrito} =require('../middleware/handleErrors.js')

//ROUTING

/* ----------------------------------------GETs----------------------------------------------- */
//GET todos los carritos
router.get("/", cartController.getCarts)

//carrito por ID
router.get("/:cid", cartController.getCartbyId)

/* ----------------------------------------POSTs----------------------------------------------- */
//Crear un nuevo carrito
router.post("/", authAdminAccess, cartController.createCart)

//Agregar prod a carrito
router.post("/:cid/products/:pid",isLoged, handleErrorAgregarACarrito, cartController.addProductToCart)

//Finalizar compra, generar ticket
router.post("/:cid/purchase",isLoged, cartController.finishPurchase)
router.get("/:cid/purchase",isLoged, cartController.finishPurchase)//Para pruebas

/* ----------------------------------------PUTs----------------------------------------------- */
//Actualizar carrito con arreglo
router.put('/:cid',isLoged, cartController.updateProductsWithArrayInCart)

//Actualizar cantidad de un prod en el carrito
router.put('/:cid/products/:pid', cartController.updateQuantityOfProdInCart)

/* ----------------------------------------DELETEs----------------------------------------------- */
//Eliminar un carrito
router.delete("/:cid",isLoged,authAdminAccess, cartController.deleteCart)

//Eliminar un producto de un carrito
router.delete("/:cid/products/:pid" ,isLoged, cartController.deleteProductFromCart)

module.exports = router;

