const express = require("express");
const router = express.Router();

//product manager
const ProductManager = require("../controller/product-manager.js")
//Cart manager
const CartManager = require("../controller/cart-manager.js")

//Instancia de CartManager
const manager = new CartManager("./src/models/carrito.json")
//Instancia de productManager
const managerProds = new ProductManager("./src/models/productos.json")

//manager.setProducts(manager.products) //Crear el arrchivo json con array vacío



//ROUTING

/* ----------------------------------------GETs----------------------------------------------- */
//GET todos los carritos
router.get("/", async (req, res)=>{
    try {
        //Cargamos el array de carritos
        const carts = await manager.readCarts();
        return res.send(carts)
    } catch (error) {
        return res.send(`Error al procesar la solicitud. ERROR ${error}`)
    }
})

//carrito por ID
router.get("/:cid", async (req, res)=>{
    try{
        //Me guardo el id del carrito
        let cid = parseInt(req.params.cid)

        //guardo el carrito con ese id
        const cart = await manager.readCartbyId(cid)

        if(cart){
            return res.send(cart)
        }else{
            return res.send(`El carrito con ID:${cid} no se encuentra.`)
        }
    }catch(error){
        return res.send(`Error al procesar la solicitud. ERROR ${error}`)
    }
})

/* ----------------------------------------POSTs----------------------------------------------- */
//Crear un nuevo carrito
router.post("/", async (req, res)=>{
    try {
        //info del producto desde el body
        let {products = []} = req.body;

        //creo el carrito (Con ID auto generado)
        const resp = await manager.addNewCart(products)
        return res.send(resp)

    } catch (error) {
        return res.send(`Error al procesar la solicitud de crear el carrito. ERROR ${error}`)
    }
})

//Agregar prod a carrito
router.post("/:cid/products/:pid", async (req, res)=>{
    try {
        //Me guardo el id del carrito
        let cid = parseInt(req.params.cid)

        //Me guardo el id del prod
        let pid = parseInt(req.params.pid)

        //Me guardo el producto a agregar
        const prod = await managerProds.readProductsbyId(pid);

        if (prod){
            if (prod.status){
                //agrego el producto al carrito
                const resp = await manager.addProductToCart(cid, pid)
                res.send(resp)
            }else{
                return res.send(`El status del producto con ID ${pid} es inactivo.`) 
            }
        }else{
            return  res.send(`El priducto de ID ${pid} No existe`)
        }

    } catch (error) {
        res.send(`Error al procesar la solicitud de agregar producto al carrito. ERROR ${error}`)
    }
})

/* ----------------------------------------DELETE----------------------------------------------- */
router.delete("/:cid", async (req, res)=>{
    try{
        //Me guardo el id del carrito
        let cid = parseInt(req.params.cid)

        //Elimino el carrito
        const resp = await manager.deleteCart(cid)
        res.send(resp)
    }catch(error){
        return res.send(`Error al procesar la solicitud. ERROR ${error}`)
    }
})

module.exports = router;

