const CartsRepository = require("../repositories/cart.repository.js");
const cartsRepository = new CartsRepository();

const UserRepository = require("../repositories/user.repository.js");
const userRepository = new UserRepository();

const ProductsRepository = require("../repositories/product.repository.js");
const productsRepository = new ProductsRepository();

const TicketRepository = require("../repositories/ticket.repository.js");
const ticketRepository = new TicketRepository();

const { sendPurchaseMail } = require("../services/emailsManager.js");

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
            return res.status(500).send({status:500, message:`${error}`})
        }
    }
    
    //ruta ¨/:cid¨, metodo GET
    async getCartbyId(req, res) {
        try {
            let cid = req.params.cid;
            if (!cid){
                return res.status(400).send({status:400, message: 'Solicitud incorrecta. No se encontró un ID de cart asignado.' })
            } 
            
            const cart = await cartsRepository.getCartbyId(cid)
            if(!cart || cart.length === 0){
                return res.status(404).send({status:404, message: 'No se encontró el carrito con el ID asignado.'})
            }
            
            req.logger.info('carrito por id obtenido con exito')
            return res.status(200).send(cart)

        } catch (error) {
            req.logger.error('No se pudo obtener el carrito por id. ', error)
            return res.status(500).send({status:500, message: `${error}` })
        }
    }
    
    //ruta ¨/tickets¨, metodo GET
    async getTickets(req, res){
        try {
            const tickets = await ticketRepository.getTickets()
            if (!tickets) {
                return res.status(404).send({status:404, message: "No se encontraron tickets."});
            }
            
            req.logger.info('tickets obtenidos con exito')
            return res.status(200).send(tickets);

        } catch (error) {
            req.logger.error('No se pudieron obtener los tickets: ', error)
            return res.status(500).send({status:500, message:`${error}`})
        }
    }
    
    //ruta ¨/tickets/:email, metodo GET
    async getTicketByPurchaser(req, res) {
        try {
            let email = req.params.email;
            if (!email){
                return res.status(400).send({status:400, message: 'Solicitud incorrecta. No se encontró un email del owner de los tickets.' })
            } 
            
            const tickets = await ticketRepository.getTicketByPurchaser(email)
            if(!tickets){
                return res.status(404).send({status:404, message: 'No se encontraron tickets con el email asignado.'})
            }
            
            req.logger.info('tickets por email obtenidos con exito')
            return res.status(200).send(tickets)

        } catch (error) {
            req.logger.error('No se pudo obtener el tickets por email. ', error)
            return res.status(500).send({status:500, message: `${error}` })
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
            return  res.status(500).send({status:500, message:`${error}`})
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
            return  res.status(500).send({status:500, message:`${error}`})
        }
    }

    //ruta ¨/:cid/purchase¨, metodo POST
    async finishPurchase(req, res){
        try {
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
                                               
                    //Separo los prods con stock sufuiciente
                    if(productoBD.stock >= prod.quantity){
                            
                        //Me creo el prod a guardar en el ticket
                        const {_id, title, price, onSale, thumbnail, descuento, code, owner}= prod.product;
                        const ticketProd = {
                            _id: _id,
                            title: title,
                            thumbnail: thumbnail,
                            price: price,
                            onSale :onSale,
                            descuento: descuento,
                            code: code,
                            owner: owner
                        }
                            
                        purchase.push({product: ticketProd, quantity: prod.quantity});
                        amount += (prod.product.price - (prod.product.descuento * prod.product.price /100)) * prod.quantity;

                    }else{
                        cartNonStock.push(prod);
                    }
                };

                if(purchase.length > 0){

                    //Genero el ticket con el total de la compra 
                    const ticket = await ticketRepository.addTicket(amount, user.email, purchase)
                        .then(async (ticket)=> {

                            //Si se genera el ticket, resto el stock de los productos
                            for (const item of purchase){
                                await productsRepository.subtractStock(item.product._id ,item.quantity);
                            }

                            //actualizo el carrito con solo los prods que no se pudieron comprar.
                            await cartsRepository.updateProductsWithArrayInCart(cid, cartNonStock)
                                .then(()=>req.logger.info('carrito actualizado'))

                            //Envio el ticket de compra
                            await sendPurchaseMail(user.email, user.first_name, ticket);

                            req.logger.info('nuevo ticket generado')
                                return ticket;
                        })
                        .catch((error)=>{
                            req.logger.error(`error al generar el ticket, ${error}`)
                            return res.status(400).send({status:400, message: `error al generar el ticket, ${error}`})
                        })
                    
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
            return res.status(500).send({status:500, message: `${error}` })
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
                .then((respuesta)=> res.stauts(200).send(respuesta))

        } catch (error) {
            req.logger.error('No se pudo actrualizar el carrito con array.', error)
            if(error.name === 'Cart not found'){
                return res.status(404).send({status:404, message:'Carrito no encontrado'})
            }
            return res.status(500).send({status:500, message: `${error}` })
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

            return res.status(500).send({status:500,message:`${error}`})
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
            return res.status(500).send({status:500, message: `${error}` })
        }
    }

    //ruta ¨/:cid¨, metodo DELETE 
    async deleteCart(req, res){
        try{
            let cid = req.params.cid
            if (!cid){
                return res.status(400).send({status:400, message: 'Solicitud incorrecta. El parámetros de consulta no es válido.' })
            } 
            
            await cartsRepository.deleteCart(cid)
                .then(respuesta => res.status(200).send(respuesta))
            
        }catch(error){
            req.logger.error('No se pudo borrar el carrito.', error)
            if(error.name === 'Cart not found'){
                return res.status(404).send({status:404, message: error.message})
            }
            return res.status(500).send({status:500, message: `${error}` })
        }
    }
}

module.exports = CartsController;