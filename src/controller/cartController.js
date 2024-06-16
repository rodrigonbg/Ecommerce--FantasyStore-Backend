const CartsRepository = require("../repositories/cart.repository.js");
const cartsRepository = new CartsRepository();

const UserRepository = require("../repositories/user.repository.js");
const userRepository = new UserRepository();

const ProductsRepository = require("../repositories/product.repository.js");
const productsRepository = new ProductsRepository();

const TicketRepository = require("../repositories/ticket.repository.js");
const { sendPurchaseMail } = require("../services/emailsManager.js");
const ticketRepository = new TicketRepository();

class CartsController {

    //ruta ¨/¨, metodo GET
    async getCarts(req, res){
        try {
            const carts = await cartsRepository.getCarts()
            if (!carts || carts.length === 0) {
                return res.status(404).send({status:404, message: "No se encontraron carritos."});
            }
            
            req.logger.info('carritos obtenidos con exito')
            return res.status(200).send(carts);

        } catch (error) {
            req.logger.error('No se pudieron obtener los carritos: ', error)
            return res.status(500).send({status:404, message:`Error interno del servidor. No se pudieron obtener los carritos. ERROR ${error}`})
        }
    }
    
    //ruta ¨/:cid¨, metodo GET
    async getCartbyId(req, res) {
        try {
            let cid = req.params.cid;
            if (!cid){
                return res.status(400).send({status:400, message: 'Solicitud incorrecta. El parámetros de consulta no es válido.' })
            } 
            
            const cart = await cartsRepository.getCartbyId(cid)
            
            if(!cart || cart.length === 0){
                return res.status(404).send({status:404, message: 'No se encontró el carrito.'})
            }
            
            req.logger.info('carrito por id obtenido con exito')
            return res.status(200).send(cart)

        } catch (error) {
            req.logger.error('No se pudo obtener el carrito por id. ', error)
            res.status(500).send({status:500, message: `Ocurrio un error interno del servidor. Error: ${error}` })
        }
    }
    
    //ruta ¨/¨, metodo POST
    async createCart(req, res){
        try {
            await cartsRepository.createCart()
                .then(respuesta => res.status(201).send(respuesta))
                .then(()=> req.logger.info('carrito nuevo creado con exito'))
        } catch (error) {
            req.logger.error('No se pudo crear el carrito.', error)
            return  res.status(500).send({status:500, message:`Error interno del servidor. ${error}`})
        }
    }

    //ruta ¨/:cid/products/:pid¨, metodo POST
    async addProductToCart(req, res){
        try {
            let cid = req.params.cid
            let pid = req.params.pid
            let quantity = req.body.quantity

            if (!cid || !pid){
                return res.status(400).send({status:400, message: 'Solicitud incorrecta. El parámetros de consulta no es válido.' })
            } 

            //Por defecto es 1. entonces está bien que no se pase por el body, pero si existe, tiene que ser un numero
            if (quantity){
                if (!Number.isInteger(parseInt(quantity)) || quantity <= 0){
                    return res.status(400).send({status:400, message: 'Solicitud incorrecta. La cantidad debe ser un entero positivo.' })
                }
            } 
            
            await cartsRepository.addProductToCart(cid, pid, quantity)
                .then((respuesta)=> res.status(201).send(respuesta))
                .then(()=> req.logger.info(`producto de id: ${pid} agregado a carrito de id: ${cid} con exito`))
        } catch (error) {
            req.logger.error('error al agregar producto a carrito.', error)
            if(error.name==='Cart not found' || error.name==='Product not found'){
                return res.status(404).send({status:404, message: error.message})
            }
            if(error.name==='Inactive Product'){
                return res.status(400).send({status:403, message: error.message})
            }
            return  res.status(500).send({status:500, message:`Error interno del servidor. ${error}`})
        }
    }

    //ruta ¨/:cid/purchase¨, metodo POST
    async finishPurchase(req, res){
        try {
            //Me guardo el id del carrito y traigo el carrito
            let cid = req.params.cid
            if (!cid ){
                return res.status(400).send({status:400, message: 'Solicitud incorrecta. El parámetros de consulta no es válido.' })
            }

            const cart = await cartsRepository.getCartbyId(cid);
            if (!cart ){
                return res.status(404).send({status:404, message: 'Solicitud incorrecta. Carrito no encontrado' })
            }

            const user = await userRepository.getUserbyCartId(cid);
            if (!user ){
                return res.status(404).send({status:404, message: 'Solicitud incorrecta. Usuario no encontrado' })
            } 
            
            let amount = 0;
            let cartNonStock = [];
            let purchase = [];

            if (cart.products.length > 0){
                    
                for (const prod of cart.products){
                    const productoBD = await productsRepository.getProductById(prod.product._id);
                                               
                    //Si hay Stock, aumento el precio y resto el stock de los productos en la bd
                    if(productoBD.stock >= prod.quantity){
                            
                        //Me creo el prod a guardar en el ticket
                        const {_id, title, price, onSale, descuento, code}= prod.product;
                        const ticketProd = {
                            _id: _id,
                            title: title,
                            price: price,
                            onSale :onSale,
                            descuento: descuento,
                            code: code
                        }
                            
                        purchase.push({product: ticketProd, quantity: prod.quantity})
                        amount += (prod.product.price - (prod.product.descuento * prod.product.price /100)) * prod.quantity
                        const updatedProd = await productsRepository.subtractStock(prod.product._id ,prod.quantity);
                    }else{
                        //si no hay stock lo agrego a otro arreglo para gestionarlo luego
                        cartNonStock.push(prod);
                    }
                };
                    
                if(purchase.length > 0){
                    //Genero el ticket con el total de la compra 
                    const ticket = await ticketRepository.addTicket(amount, user.email, purchase)
                                        .then((ticket)=> {
                                            req.logger.info('nuevo ticket generado')
                                            return ticket;
                                        })
                                        .catch((error)=>{
                                            req.logger.error(`error al generar el ticket, ${error}`)
                                            return res.status(400).send({status:400, message: `error al generar el ticket, ${error}`})
                                        })

                    //actualizo el carrito con solo los prods que no se pudieron comprar.
                    await cartsRepository.updateProductsWithArrayInCart(cid, cartNonStock)
                                        .then(()=>req.logger.info('carrito actualizado'))

                    await sendPurchaseMail(user.email, user.first_name, ticket);
                    
                    return res.status(201).send(ticket);
                }else{
                    return res.status(400).send({status:400, message: 'no hay productos con suficiente stock en este carrito.'})
                }
                    
            }else{
                return res.status(400).send({status:400, message: `El carrito del usuario esá vacío.` })
            }

        } catch (error) {
            req.logger.error('error al finalizar la compra.', error)

            if(error.name === 'Error de datos'){
                return res.status(400).send({status:404, message: error.message})
            }
            return res.status(500).send({status:500, message: `Error interno del servidor al eliminar el carrito. Error ${error}` })
        }
    }

    //ruta ¨/:cid¨, metodo PUT
    async updateProductsWithArrayInCart(req, res){
        try {
            let cid = req.params.cid
            if (!cid){
                return res.status(400).send({status:400, message: 'Solicitud incorrecta. El parámetros de consulta no es válido.' })
            } 

            let arrayProds = req.body
        
            await cartsRepository.updateProductsWithArrayInCart(cid, arrayProds)//por defecto es vacío
                .then((respuesta)=> res.send(respuesta))
                .then(()=>{res.status(200)})
        } catch (error) {
            req.logger.error('No se pudo actrualizar el carrito con array.', error)
            if(error.name === 'Cart not found'){
                return res.status(404).send({status:404, message:'Carrito no encontrado'})
            }
            return res.status(500).send({status:500, message: `Error interno del servidor al actualizar el carrito. Error ${error}` })
        }
    }

    //ruta ¨/:cid/products/:pid¨, metodo PUT
    async updateQuantityOfProdInCart(req, res){
        try {
            //validado desde el middlware handleAgregarACarrito
            let cid = req.params.cid
            let pid = req.params.pid
            if (!cid || !pid){
                return res.status(400).send({status:400, message: 'Solicitud incorrecta. El parámetros de consulta no es válido.' })
            }
            let quantity = req.body.quantity
            if(!quantity) return res.status(400).send({status:400, message:'Error en el campo quantity.'})

            await cartsRepository.updateQuantityOfProdInCart(cid, pid, quantity)
                .then((respuesta)=> res.status(200).send(respuesta))
                .then(()=>{req.logger.error('cantidad de prod en carrito actualizada.')})

        } catch (error) {
            req.logger.error('No se pudo actualizar cantidad en carrito.', error)

            if(error.name === 'Parametros invalidos' || error.name === 'Inactive product'){
                res.status(400).send({status:400, message: error.message})
            }
            if(error.name === 'Cart not found' || error.name === 'Product not found' || error.name ==='Product not found in cart'){
                res.status(404).send({status:404, message: error.message})
            }

            res.status(500).send({status:500,message:`Error Interno del servidor al actualizar carrito. ERROR ${error}`})
        }
    }

    //ruta ¨/:cid/products/:pid¨, metodo DELETE
    async deleteProductFromCart(req, res){
        try{
            let cid = req.params.cid
            let pid = req.params.pid
            if (!cid || !pid){
                return res.status(400).send({status:400, message: 'Solicitud incorrecta. El parámetros de consulta no es válido.' })
            }

            //Elimino el carrito
            await cartsRepository.deleteProductFromCart(cid, pid)
                .then(respuesta => res.status(200).send(respuesta))

        }catch(error){
            req.logger.error('No se pudo borrar producto del carrito.', error)
            if(error.name === 'Cart not found'){
                return res.status(404).send({status:404, message: error.message})
            }
            if(error.name === 'Parametros invalidos'){
                return res.status(400).send({status:400, message: error.message})
            }
            if(error.name === 'Product not found in cart'){
                return res.status(404).send({status:404, message: error.message})
            }
            return res.status(500).send({status:500, message: `Error interno del servidor al eliminar el carrito. Error ${error}` })
        }
    }

    //ruta ¨/:cid¨, metodo DELETE 
    async deleteCart(req, res){
        try{
            //Me guardo el id del carrito
            let cid = req.params.cid
            if (!cid){
                return res.status(400).send({status:400, message: 'Solicitud incorrecta. El parámetros de consulta no es válido.' })
            } 
            
            //Elimino el carrito
            await cartsRepository.deleteCart(cid)
                .then(respuesta => res.status(200).send(respuesta))
            
        }catch(error){
            req.logger.error('No se pudo borrar el carrito.', error)
            if(error.name === 'Cart not found'){
                return res.status(404).send({status:404, message: error.message})
            }
            return res.status(500).send({status:500, message: `Error interno del servidor al eliminar el carrito. Error ${error}` })
        }
    }
}

module.exports = CartsController;