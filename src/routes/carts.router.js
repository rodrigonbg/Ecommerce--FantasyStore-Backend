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

//models de mongodb
const cartModel = require("../models/carts.models");
const productModel = require("../models/products.models.js");



//ROUTING

/* ----------------------------------------GETs----------------------------------------------- */
//GET todos los carritos
router.get("/", async (req, res)=>{
    try {
        //Cargamos el array de carritos
        const carts = await cartModel.find();
        return res.send(carts)
    } catch (error) {
        return res.send(`Error al procesar la solicitud. ERROR ${error}`)
    }
})
/* router.get("/", async (req, res)=>{
    try {
        //Cargamos el array de carritos
        const carts = await manager.readCarts();
        return res.send(carts)
    } catch (error) {
        return res.send(`Error al procesar la solicitud. ERROR ${error}`)
    }
}) */

//carrito por ID
router.get("/:cid", async (req, res)=>{
    try{
        //Me guardo el id del carrito
        let cid = req.params.cid;

        //guardo el carrito con ese id
        const cart = await cartModel.findById(cid);

        if(cart){
            return res.send(cart)
        }else{
            return res.send(`El carrito con ID:${cid} no se encuentra.`)
        }
    }catch(error){
        return res.send(`Error al procesar la solicitud. ERROR ${error}`)
    }
})
/* router.get("/:cid", async (req, res)=>{
    try{
        //Me guardo el id del carrito
        let cid = parseInt(req.params.cid);

        //guardo el carrito con ese id
        const cart = await manager.readCartById(cid);

        if(cart){
            return res.send(cart)
        }else{
            return res.send(`El carrito con ID:${cid} no se encuentra.`)
        }
    }catch(error){
        return res.send(`Error al procesar la solicitud. ERROR ${error}`)
    }
}) */

/* ----------------------------------------POSTs----------------------------------------------- */
//Crear un nuevo carrito
router.post("/", async (req, res)=>{
    try {
        //info del producto desde el body
        let {products = []} = req.body;            
        
        //creo el carrito (Con ID auto generado) y lo guardo
        const cart = new cartModel({products});

        await cart.save();
        return res.send(cart)

    } catch (error) {
        return res.send(`Error al procesar la solicitud de crear el carrito. ERROR ${error}`)
    }
})
/* router.post("/", async (req, res)=>{
    try {
        //info del producto desde el body
        let {products = []} = req.body;

        //creo el carrito (Con ID auto generado)
        const resp = await manager.addNewCart(products)
        return res.send(resp)

    } catch (error) {
        return res.send(`Error al procesar la solicitud de crear el carrito. ERROR ${error}`)
    }
}) */

//Agregar prod a carrito
router.post("/:cid/products/:pid", async (req, res)=>{
    try {
        //Me guardo el id del carrito
        let cid = req.params.cid

        //Me guardo el id del prod
        let pid = req.params.pid

        //Me guardo el carrito en cuestion
        const cart = await cartModel.findById(cid)
        
        if (cart == null){
            res.status(404)
            throw ("No se encontró el carrito")
        }

        //Me guardo el producto a agregar
        const prod = await  productModel.findById(pid); 

        if (prod){
            if (prod.status){
                //Si prod existe y está activo, lo agrego al carrito.

                //recorro el array de prods del carrito y guardo el index del producto si ya está agregado.
                const indexProd = cart.products.findIndex((item) => item._id == pid);

                if (indexProd >= 0 ){
                    //si el prod ya estaba en el carrito, le sumo las unidades que se van a agregar.
                    cart.products[indexProd].quantity += 1;
                }else{
                    //si no estaba en el carrito, lo agrego con una unidad.
                    cart.products.push({_id:  pid , quantity : 1});
                }

                //guardo los cambios en la bd
                await cartModel.findByIdAndUpdate(cid, cart)
                    .then(()=> res.send('producto agregado a la bd'))
                    .catch(err => res.send (`Error al guardar el cambio en la BD ${err}`))

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
/* router.post("/:cid/products/:pid", async (req, res)=>{
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
}) */

/* ----------------------------------------DELETE----------------------------------------------- */
router.delete("/:cid", async (req, res)=>{
    try{
        //Me guardo el id del carrito
        let cid = req.params.cid

        //Elimino el carrito
        await cartModel.findByIdAndDelete(cid)
            .then(resp => res.send(`carrito eliminado: \n ${resp}`))
            .catch(err => res.status(400).send(`Error al intentar borrar el carrito ${err}`))

    }catch(error){
        return res.send(`Error al procesar la solicitud. ERROR ${error}`)
    }
})
/* router.delete("/:cid", async (req, res)=>{
    try{
        //Me guardo el id del carrito
        let cid = parseInt(req.params.cid)

        //Elimino el carrito
        const resp = await manager.deleteCart(cid)
        res.send(resp)
    }catch(error){
        return res.send(`Error al procesar la solicitud. ERROR ${error}`)
    }
}) */

module.exports = router;

