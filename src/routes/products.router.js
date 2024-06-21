const express = require("express");
const router = express.Router();

//product Controller
const ProductController = require('../controller/productController.js');
const productcontroller = new ProductController();

//Midlewares
const {authAdminAccess, authUserAccess, isLoged, authNotUserAccess, authPremiumAccess} = require('../middleware/profileAccess.js')
const {handleErrorCrearProducto, handleErrorCrearUser, handleErrorAgregarACarrito} =require('../middleware/handleErrors.js')

//Multer
const {uploaderDocs, uploaderProds} = require('../middleware/multer.js')

//ROUTING
/* ----------------------------------------GETs----------------------------------------------- */
//Productos por querys
router.get("/", productcontroller.getProducts)
router.get("/mockingproducts", isLoged, authAdminAccess, productcontroller.getProductsFaker)

//productos por owner
router.get("/productsOwner", isLoged, productcontroller.getProductsOwner)

//productos por ID
router.get("/:pid", productcontroller.getProductById)

/* ----------------------------------------POSTs----------------------------------------------- */
//Subir un producto a la base de datos (admin)
router.post("/admin", uploaderProds.array('thumbnail'), isLoged, authAdminAccess, handleErrorCrearProducto, productcontroller.addProductAdmin)

//Subir un producto a la base de datos (premium)
router.post("/premium", uploaderProds.array('thumbnail'), isLoged, authPremiumAccess, handleErrorCrearProducto,  productcontroller.addProductPremium)

/* ----------------------------------------PUTs----------------------------------------------- */
//Actualizar un producto en la base de datos
router.put("/:pid", authAdminAccess, handleErrorCrearProducto, uploaderProds.array('thumbnail'), productcontroller.updateProduct)



/* ----------------------------------------DELETEs----------------------------------------------- */
//Eliminar un producto de la base de datos (admin)
router.post("/admin/:pid", authAdminAccess, productcontroller.deleteProductAdmin)

//Eliminar un producto de la base de datos (premium)
router.post("/premium/:pid", authPremiumAccess, productcontroller.deleteProductPremium)

module.exports = router;