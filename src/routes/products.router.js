const express = require("express");
const router = express.Router();


//product manager
const ProductManager = require("../controller/product-manager.js")
//Instancia de productManager
const manager = new ProductManager("./src/models/productos.json")
//manager.setProducts(manager.products)  //Crear el arrchivo json con array vacío



//ROUTING

/* ----------------------------------------GETs----------------------------------------------- */
//Productos por querys
router.get("/", async (req, res)=>{
    try {
        //Cargamos el array de productos
        const arrayProductos = await manager.readProducts()

        //Guardamos el query
        let limit = parseInt(req.query.limit);

        //Si hay limite, filtaramos el array, de lo contrario mostramos todos los elementos
        if(limit){
            const arrayConLimite = arrayProductos.slice(0, limit)
            return res.send(arrayConLimite)
        }else{
            return res.send(arrayProductos)
        }
    } catch (error) {
        return res.send(`Error al mostrar los productos. Error: ${error}`)
    }
})

//productos por ID
router.get("/:pid", async (req, res)=>{
    try{
        //Me guardo el id 
        let pid = parseInt(req.params.pid)

        //guardo el prod con ese id
        const prod = await manager.readProductsbyId(pid)

        if(prod){
            return res.send(prod)
        }else{
            return res.send(`El ID:${pid} del producto es incorrecto.`)
        }
    }catch(error){
        return res.send(`Error al mostrar el producto de ID ${pid}. Error (${error})`)
    }
})


/* ----------------------------------------POST----------------------------------------------- */
router.post("/", async (req, res)=>{
    try {
        //info del producto desde el body
        let {title, description, price, thumbnail, code, status=true, stock} = req.body;

        const newProduct ={
            title: title,
            description: description,
            price: price,
            thumbnail: thumbnail,
            code: code,
            status: status,
            stock: stock
        }

        //agrego el producto (Con ID auto generado)
        await manager.addProduct(newProduct)
            .then((resp)=> res.send (resp))
    } catch (error) {
        return res.send(`Error al cargar el nuevo producto. Error: ${error}`)
    }
})


/* ----------------------------------------PUT----------------------------------------------- */
router.put("/:pid", async (req, res)=>{
    try {
        //Me guardo el id 
        let pid = parseInt(req.params.pid)

        //info del producto desde el body
        let {title, description, price, thumbnail, code, status=true, stock} = req.body;

        const newProduct ={
            title: title,
            description: description,
            price: price,
            thumbnail: thumbnail,
            code: code,
            status,
            stock: stock
        }

        //actualizo el producto (sin actualizar ID)
        const resp = await manager.updateProduct(pid, newProduct)
        res.send(resp)
        
    } catch (error) {
        res.send(`Error al actualizar el producto. ERROR ${error}`)
    }
})


/* ----------------------------------------DELETE----------------------------------------------- */
router.delete("/:pid", async (req, res)=>{
    try {
        //Me guardo el id 
        let pid = parseInt(req.params.pid)
        const resp = await manager.deleteProduct(pid).then(res => res)
        return res.send(resp)

    }catch(error){
        return res.send(`Error al eliminar el producto. ERROR ${error}`)
    }
})



module.exports = router;