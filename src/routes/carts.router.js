const express = require("express");
const router = express.Router();

//Cart Controller
const CartController = require("../controller/cartController.js")
const cartController = new CartController()

//Midlewares
//const {authAdminAccess, authUserAccess, isLoged} = require('../middleware/profileAccess.js')
const {handleErrorCrearProducto, handleErrorCrearUser, handleErrorAgregarACarrito} =require('../middleware/handleErrors.js')

//ROUTING

/* ----------------------------------------GETs----------------------------------------------- */
//GET todos los carritos
router.get("/", cartController.getCarts)

//carrito por ID
router.get("/:cid", cartController.getCartbyId)


/* ----------------------------------------POSTs----------------------------------------------- */
//Crear un nuevo carrito
router.post("/", cartController.createCart)

//Agregar prod a carrito
router.post("/:cid/products/:pid", handleErrorAgregarACarrito, cartController.addProductToCart)

//Finalizar compra, generar ticket
router.post("/:cid/purchase", cartController.finishPurchase)
router.get("/:cid/purchase", cartController.finishPurchase)//Para pruebas

/* ----------------------------------------PUTs----------------------------------------------- */
//Actualizar carrito con arreglo
router.put('/:cid', cartController.updateProductsWithArrayInCart)

//Actualizar cantidad de un prod en el carrito
router.put('/:cid/products/:pid', cartController.updateQuantityOfProdInCart)

/* ----------------------------------------DELETEs----------------------------------------------- */
//Eliminar un carrito
router.delete("/:cid", cartController.deleteCart)

//Eliminar un producto de un carrito
router.delete("/:cid/products/:pid", cartController.deleteProductFromCart)

module.exports = router;

