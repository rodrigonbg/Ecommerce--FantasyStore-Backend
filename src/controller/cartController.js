const CartsRepository = require("../repositories/cart.repository.js");
const cartsRepository = new CartsRepository();

const ProductsRepository = require("../repositories/product.repository.js");
const productsRepository = new ProductsRepository();

const TicketRepository = require("../repositories/ticket.repository.js");
const ticketRepository = new TicketRepository();



class CartsController {

    //ruta ¨/¨, metodo GET
    async getCarts(req, res){
        try {
            await cartsRepository.getCarts()
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
            
            await cartsRepository.getCartbyId(cid)
                .then(respuesta => res.send(respuesta))
        } catch (error) {
            return `Ocurrio un error al obtener el carrito a nivel ruta. ${error}`
        }
    }
    
    //ruta ¨/¨, metodo POST
    async createCart(req, res){
        try {
            await cartsRepository.createCart()
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
        
            await cartsRepository.addProductToCart(cid, pid, quantity)
                .then((respuesta)=> res.send(respuesta))   
        } catch (error) {
            res.send(`Error al procesar la solicitud de agregar producto al carrito a nivel ruta. ERROR ${error}`)
        }
    }

    //ruta ¨/:cid/purchase¨, metodo POST
    async finishPurchase(req, res){
        try {
            //Me guardo el id del carrito y traigo el carrito
            let cid = req.params.cid
            const cart = await cartsRepository.getCartbyId(cid);

            if (cart){
                let amount = 0;

                if (cart.products.lenght > 0){
                    //Controlar que haya stock y aumentar el precio total de la compra 
                    cart.products.forEach(async prod => {
                        const producto = await productsRepository.getProductById(prod.products._id);
                        if(producto.stock >= prod.stock){
                            amount += (prod.products.price - (prod.products.descuento * prod.products.price /100))* prod.stock
                        }else{
                            throw new Error(`El producto de id ${prod.products._id} no tinee stock suficiente para la compra.`)
                        }
                    });

                    //Si hay stock suficicente para todos los articulos del carrito, los descontamos del stock en la bd 
                    cart.products.forEach(async prod => {
                       await productsRepository.subtractStock(prod.products._id ,prod.stock);
                    });

                    //Generlo el ticket
                    const respuesta = await ticketRepository.addTicket(amount, req.user.mail);

                    //Vacio el carrito
                    await cartsRepository.emptyCart(cid);

                    res.send(respuesta);
                    
                }else{
                    throw new Error( "EL carrito está vacío.")
                }

            }else{
                res.status(404).send('No se ha encontrado un carrito con ese ID')
            }
        } catch (error) {
            res.send(error)
        }
    }

    //ruta ¨/:cid¨, metodo PUT
    async updateProductsWithArrayInCart(req, res){
        try {
            let cid = req.params.cid
            let arrayProds = req.body
        
            await cartsRepository.updateProductsWithArrayInCart(cid, arrayProds)//por defecto es vacío
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
            await cartsRepository.updateQuantityOfProdInCart(cid, pid, quantity)
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
            await cartsRepository.deleteProductFromCart(cid, pid)
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
            await cartsRepository.deleteCart(cid)
                .then(respuesta => res.send(respuesta))
                .catch(err => res.status(400).send(`Error al intentar borrar el carrito ${err}`))
            
        }catch(error){
            return res.send(`Error al procesar la solicitud a nivel ruta. ERROR ${error}`)
        }
    }
}

module.exports = CartsController;