const express = require("express");
const router = express.Router();

//product manager
const ProductManager = require("../controller/product-manager.js")
//Instancia de productManager
const manager = new ProductManager("./src/models/productos.json")

//ROUTING

/* ----------------------------------------GETs----------------------------------------------- */
router.get("/", async (req, res)=>{
    try {
        //traigo los productos
        const products = await manager.readProducts();

        //le paso los productos al index y lo renderizo
        res.render('index',{products: products});

    } catch (err) {
        res.status(500).json({
            error: `Error al obtener los productos. Error: ${err}`
        })
    }
})

router.get("/realtimeproducts", async (req, res)=>{
    try {
        //renderizo realTimeProducts
        res.render('realTimeProducts');

    } catch (err) {
        res.status(500).json({
            error: `Error al obtener los productos en tiempo real. Error: ${err}`
        })
    }
})

module.exports = router;