const CartsServices = require("../services/cartServices.js");
const cartsServices = new CartsServices();

class CartsController {

    //ruta ¨/¨, metodo GET
    async getCarts(req, res){
        try {
            await cartsServices.getCarts()
            .then(respuesta => res.send(respuesta))
        } catch (error) {
            return res.send(`Error al procesar la solicitud a nivel ruta. ERROR ${error}`)
        }
    }
    
    //ruta ¨/:cid¨, metodo GET
    async getCartbyId(req, res) {
        try {
            //Me guardo el id del carrito
            let cid = req.params.cid;
            
            await cartsServices.getCartbyId(cid)
                .then(respuesta => res.send(respuesta))
        } catch (error) {
            return `Ocurrio un error al obtener el carrito a nivel ruta. ${error}`
        }
    }
    
    //ruta ¨/¨, metodo POST
    async createCart(req, res){
        try {
            await cartsServices.createCart()
                .then(respuesta => res.send(respuesta))
        } catch (error) {
            return `Error al crear el nuevo carrito de compras a nivel ruta. ${error}`
        }
    }

    //ruta ¨/:cid/products/:pid¨, metodo POST
    async addProductToCart(req, res){
        try {
            //Me guardo el id del carrito
            let cid = req.params.cid

            //Me guardo el id del prod
            let pid = req.params.pid
        
            let quantity = req.params.quantity
        
            await cartsServices.addProductToCart(cid, pid, quantity)
                .then((respuesta)=> res.send(respuesta))   
        } catch (error) {
            res.send(`Error al procesar la solicitud de agregar producto al carrito a nivel ruta. ERROR ${error}`)
        }
    }

    //ruta ¨/:cid¨, metodo PUT
    async updateProductsWithArrayInCart(req, res){
        try {
            let cid = req.params.cid
            let arrayProds = req.body
        
            await cartsServices.updateProductsWithArrayInCart(cid, arrayProds)//por defecto es vacío
                .then((respuesta)=> res.send(respuesta))
                .then(()=>{res.status(201)})
        } catch (error) {
            return (`Error al agregar producto al carrito a nivel ruta. Error: ${error}`)
        }
    }

    //ruta ¨/:cid/products/:pid¨, metodo PUT
    async updateQuantityOfProdInCart(req, res){
        try {
            let cid = req.params.cid
            let pid = req.params.pid
            let quantity = req.body.quantity
            await cartsServices.updateQuantityOfProdInCart(cid, pid, quantity)
                .then((respuesta)=> res.send(respuesta))
                .then(()=>{res.status(201)})
        } catch (error) {
            res.send(`Error al actualizar cantidad del producto en carrito a nivel ruta. ERROR ${error}`)
        }
    }

    //ruta ¨/:cid/products/:pid¨, metodo DELETE
    async deleteProductFromCart(req, res){
        try{
            //Me guardo los ids 
            let cid = req.params.cid
            let pid = req.params.pid
            
            //Elimino el carrito
            await cartsServices.deleteProductFromCart(cid, pid)
                .then(respuesta => res.send(respuesta))
                .catch(err => res.status(400).send(`Error al intentar borrar el carrito ${err}`))

        }catch(error){
            return res.send(`Error al procesar la solicitud a nivel ruta. ERROR ${error}`)
        }
    }

    //ruta ¨/:cid¨, metodo DELETE 
    async deleteCart(req, res){
        try{
            //Me guardo el id del carrito
            let cid = req.params.cid
            
            //Elimino el carrito
            await cartsServices.deleteCart(cid)
                .then(respuesta => res.send(respuesta))
                .catch(err => res.status(400).send(`Error al intentar borrar el carrito ${err}`))
            
        }catch(error){
            return res.send(`Error al procesar la solicitud a nivel ruta. ERROR ${error}`)
        }
    }
}

module.exports = CartsController;