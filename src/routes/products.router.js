const express = require("express");
const router = express.Router();

//product Controller
const ProductController = require('../controller/productController.js');
const productcontroller = new ProductController();

const {authAdminAccess, authUserAccess, isLoged} = require('../middleware/profileAccess.js')

//ROUTING
/* ----------------------------------------GETs----------------------------------------------- */
//Productos por querys
router.get("/", productcontroller.getProducts)
router.get("/mockingproducts", productcontroller.getProductsFaker)

//productos por ID
router.get("/:pid", productcontroller.getProductById)

/* ----------------------------------------POSTs----------------------------------------------- */
//Subir un producto a la base de datos
router.post("/", authAdminAccess, productcontroller.addProduct)

/* ----------------------------------------PUTs----------------------------------------------- */
//Actualizar un producto en la base de datos
router.put("/:pid", authAdminAccess, productcontroller.updateProduct)

/* ----------------------------------------DELETEs----------------------------------------------- */
//Eliminar un producto de la base de datos
router.delete("/:pid", authAdminAccess, productcontroller.deleteProduct)

module.exports = router;