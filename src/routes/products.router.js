const express = require("express");
const router = express.Router();

//product Controller
const ProductController = require('../controller/productController.js');
const productcontroller = new ProductController();

//ROUTING
/* ----------------------------------------GETs----------------------------------------------- */
//Productos por querys
router.get("/", productcontroller.getProducts)

//productos por ID
router.get("/:pid", productcontroller.getProductById)

/* ----------------------------------------POSTs----------------------------------------------- */
//Subir un producto a la base de datos
router.post("/", productcontroller.addProduct)

/* ----------------------------------------PUTs----------------------------------------------- */
//Actualizar un producto en la base de datos
router.put("/:pid", productcontroller.updateProduct)

/* ----------------------------------------DELETEs----------------------------------------------- */
//Eliminar un producto de la base de datos
router.delete("/:pid", productcontroller.deleteProduct)

module.exports = router;