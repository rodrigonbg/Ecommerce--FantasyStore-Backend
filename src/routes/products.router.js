const express = require("express");
const router = express.Router();

//product Controller
const ProductController = require('../controller/productController.js');
const productcontroller = new ProductController();

//Midlewares
const {authAdminAccess, authUserAccess, isLoged, authNotUserAccess} = require('../middleware/profileAccess.js')
const {handleErrorCrearProducto, handleErrorCrearUser, handleErrorAgregarACarrito} =require('../middleware/handleErrors.js')

//ROUTING
/* ----------------------------------------GETs----------------------------------------------- */
//Productos por querys
router.get("/", productcontroller.getProducts)
router.get("/mockingproducts", productcontroller.getProductsFaker)

//productos por ID
router.get("/:pid", productcontroller.getProductById)

/* ----------------------------------------POSTs----------------------------------------------- */
//Subir un producto a la base de datos (admin)
router.post("/admin", authAdminAccess, handleErrorCrearProducto, productcontroller.addProductAdmin)

//Subir un producto a la base de datos (premium)
router.post("/premium", authNotUserAccess, handleErrorCrearProducto, productcontroller.addProductPremium)

/* ----------------------------------------PUTs----------------------------------------------- */
//Actualizar un producto en la base de datos
router.put("/:pid", authAdminAccess, productcontroller.updateProduct)

/* ----------------------------------------DELETEs----------------------------------------------- */
//Eliminar un producto de la base de datos
router.delete("/:pid", authNotUserAccess, productcontroller.deleteProduct)

//Eliminar un producto de la base de datos(admin)
router.post("/premium/:pid", authNotUserAccess, productcontroller.deleteProductPremium)

module.exports = router;