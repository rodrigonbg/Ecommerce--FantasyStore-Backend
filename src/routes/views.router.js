const express = require("express");
const router = express.Router();

//product manager
//const ProductManager = require("../controller/product-manager.js")
//Instancia de productManager
//const manager = new ProductManager("./src/models/productos.json")

//productsModel
const productsModel = require("../models/products.models");

//ROUTING

/* ----------------------------------------GETs----------------------------------------------- */
router.get("/", async (req, res)=>{
    try {
        //traigo los productos
        const products = await productsModel.find();
        
        const productsMap = products.map(prod => {
            return{
                title: prod.title,
                description: prod.descripcion,
                price:  prod.price,
                id: prod._id,
                stock:  prod.stock,
                status: prod.status
            }
        })

        //le paso los productos al index y lo renderizo
        res.render('index',{products: productsMap});
        
    } catch (err) {
        res.status(500).json({
            error: `Error al obtener los productos. Error: ${err}`
        })
    }
})
/* router.get("/", async (req, res)=>{
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
}) */

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

router.get("/uploadProduct", async (req, res)=>{
    try {
        //renderizo uploadProduct
        res.render('uploadProduct');

    } catch (err) {
        res.status(500).json({
            error: `Error al cargar formulario para subir un producto. Error: ${err}`
        })
    }
})

module.exports = router;