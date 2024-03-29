const express = require("express");
const router = express.Router();

//Cart manager
//const CartManager = require("../dao/db/cart-manager-db")
//const cartManager = new  CartManager()

//Cart Controller
const CartController = require("../controller/cartController.js")
const cartController = new  CartController()

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
router.post("/:cid/products/:pid", cartController.addProductToCart)

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

