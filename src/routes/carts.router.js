const express = require("express");
const router = express.Router();

//Cart manager
const CartManager = require("../dao/db/cart-manager-db")
const cartManager = new  CartManager()

//ROUTING

/* ----------------------------------------GETs----------------------------------------------- */
//GET todos los carritos
router.get("/", async (req, res)=>{
    try {
        //traemos los carritos y los enviamos a renderizar
        await cartManager.getCarts()
            .then(respuesta => res.send(respuesta))

    } catch (error) {
        return res.send(`Error al procesar la solicitud. ERROR ${error}`)
    }
})

//carrito por ID
router.get("/:cid", async (req, res)=>{
    try{
        //Me guardo el id del carrito
        let cid = req.params.cid;

        await cartManager.getCartbyId(cid)
            .then(respuesta => res.send(respuesta))

    }catch(error){
        return res.send(`Error al procesar la solicitud. ERROR ${error}`)
    }
})

/* ----------------------------------------POSTs----------------------------------------------- */
//Crear un nuevo carrito
router.post("/", async (req, res)=>{
    try {
        //creo el carrito y renderizo la respuesta del cart manager
        await cartManager.createCart()
            .then(respuesta => res.send(respuesta)) 

    } catch (error) {
        return res.send(`Error al procesar la solicitud de crear el carrito. ERROR ${error}`)
    }
})

//Agregar prod a carrito
router.post("/:cid/products/:pid", async (req, res)=>{
    try {
        //Me guardo el id del carrito
        let cid = req.params.cid

        //Me guardo el id del prod
        let pid = req.params.pid

        let quantity = req.params.quantity

        await cartManager.addProductToCart(cid, pid, quantity)
            .then((respuesta)=> res.send(respuesta))

    } catch (error) {
        res.send(`Error al procesar la solicitud de agregar producto al carrito. ERROR ${error}`)
    }
})

/* ----------------------------------------PUTs----------------------------------------------- */
//Actualizar carrito con arreglo
router.put('/:cid', async (req, res)=>{
    let cid = req.params.cid
    let arrayProds = req.body
    
    await cartManager.updateProductsWithArrayInCart(cid, arrayProds)//por defecto es vacío
        .then((respuesta)=> res.send(respuesta))
        .then(()=>{res.status(201)})
})

//Actualizar cantidad de un prod en el carrito
router.put('/:cid/products/:pid', async (req, res)=>{
    try {
        let cid = req.params.cid
        let pid = req.params.pid
        let quantity = req.body.quantity
        await cartManager.updateQuantityOfProdInCart(cid, pid, quantity)
            .then((respuesta)=> res.send(respuesta))
            .then(()=>{res.status(201)})
    } catch (error) {
        res.send(`Error al actualizar cantidad del producto en carrito. ERROR ${error}`)
    }

})

/* ----------------------------------------DELETEs----------------------------------------------- */
//Eliminar un carrito
router.delete("/:cid", async (req, res)=>{
    try{
        //Me guardo el id del carrito
        let cid = req.params.cid
        
        //Elimino el carrito
        await cartManager.deleteCart(cid)
        .then(respuesta => res.send(respuesta))
        .catch(err => res.status(400).send(`Error al intentar borrar el carrito ${err}`))
        
    }catch(error){
        return res.send(`Error al procesar la solicitud. ERROR ${error}`)
    }
})

//Eliminar un producto de un carrito
router.delete("/:cid/products/:pid", async (req, res)=>{
    try{
        //Me guardo los ids 
        let cid = req.params.cid
        let pid = req.params.pid
        
        //Elimino el carrito
        await cartManager.deleteProductFromCart(cid, pid)
            .then(respuesta => res.send(respuesta))
            .catch(err => res.status(400).send(`Error al intentar borrar el carrito ${err}`))

    }catch(error){
        return res.send(`Error al procesar la solicitud. ERROR ${error}`)
    }
})

module.exports = router;

