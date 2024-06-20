const cartsModel = require("../models/carts.models");
const productsModel = require("../models/products.models.js")

class CartsRepository {
    async createCart(){
        try {
            const newCart = new cartsModel ({
                products : []// Por defecto se crea vacío
            })
            
            //Guardo el carrito en la base de datos
            const respuesta = await newCart.save()
            return respuesta
        } catch (error) {
           throw error
        }
    }

    async getCarts() {
        try {
            return await cartsModel.find()
        } catch (error) {
            throw error
        }
    }

    async getCartbyId(id) {
        try {
            const cart = await cartsModel.findById(id)
            if ( !cart ) {//Valido que el carrito exista
                const error = new Error()
                error.message = `No se encontró el carrito con el id: ${id}`
                error.name = 'Cart not found'
                throw error
            }
            return cart
        } catch (error) {
            throw error
        }
    }

    async addProductToCart(idCart, idProd, quantityProd=1){
        //Para agregar un producto al carrito, le paso directamente el id del carrito, del prod y la cantidad que por defecto es 1
        //Si el prod ya está en el carrito, actualizo la acantidad. De lo contrario lo agrego.
        try {
            
            if(!idCart || !idProd){
                const error = new Error()
                error.message = `Parametros invalidos`
                error.name = 'Parametros invalidos'
                throw error
            }

            const cart = await cartsModel.findById(idCart)
            if(!cart){
                const error = new Error()
                error.message = `No se encontró el carrito con el id: ${idCart}`
                error.name ='Cart not found'
                throw error
            }

            const prod = await productsModel.findById(idProd)
            if(!prod){
                const error = new Error()
                error.message = `No se encontró el Producto con el id: ${idCart}`
                error.name='Product not found'
                throw error
            }

   
            if (prod.status != true){
                const error = new Error()
                error.message = `Este producto se encuentra inactivo.`
                error.name='Inactive Product'
                throw error
            }

            //Veo si en el carrito está el producto
            if(cart.products.length === 0){
                
                cart.products.push({product: idProd, quantity: quantityProd})
            }else{
                const indexInCart = cart.products.findIndex((prod) => prod.product._id.toString() === idProd)
                
                if (indexInCart !== -1) {//Si el producto está en el carrito, incremento en la cantidad q por defecto es 1
                    cart.products[indexInCart].quantity += quantityProd;
                
                }else{//Si el prod no está, lo creo y lo pusheo
                    cart.products.push({product: idProd, quantity: quantityProd})
                }
            }

            //Marcamos la propiedad 'products' como modificada antes de guardar
            cart.markModified('products')

            //Finalmente guardo el carrito actualizado
            return await cart.save();
        } catch (error) {
            throw error
        }
    }

    async updateProductsWithArrayInCart(idCart, arrayProds=[]){
        //Por defecto, el array de prods es vacío
        try {
            //me traigo el carrito y el producto
            const cart = await cartsModel.findById(idCart)

            if ( !cart ) {//Valido que el carrito exista
                const error = new Error()
                error.message = `No se encontró el carrito con el id: ${idCart}`
                error.name='Cart not found'
                throw error
            }
            
            //actualizo el carrito
            cart.products = arrayProds;

            //Marcamos la propiedad 'products' como modificada antes de guardar
            cart.markModified('products')

            //Finalmente guardo el carrito actualizado
            return await cart.save();
        } catch (error) {
            throw error
        }
    }

    async updateQuantityOfProdInCart(idCart, idProd, quantityProd){
        try {
            if(!idCart || !idProd || !quantityProd){
                const error = new Error()
                error.message = `Todos los parametros y la cantidad de productos son necesarios`
                error.name='Parametros invalidos'
                throw error
            }
            
            if(!Number.isInteger(parseInt(quantityProd))){
                const error = new Error()
                error.message = `La cantidad del producto debe ser un entero.`
                error.name='Parametros invalidos'
                throw error
            }

            const cart = await cartsModel.findById(idCart)
            if(!cart){
                const error = new Error()
                error.message = `No se encontró el carrito con el id: ${idCart}`
                error.name='Cart not found'
                throw error
            }

            const prod = await productsModel.findById(idProd)
            if(!prod){
                const error = new Error()
                error.message = `No se encontró el producto con el id: ${idProd}`
                error.name='Product not found'
                throw error
            }

           if (prod.status != true){
                const error = new Error()
                error.message = `Este producto se encuentra inactivo.`
                error.name='Inactive product'
                throw error
 
            }

            //Veo si en el carrito está el producto
            const indexInCart = cart.products.findIndex((prod) => prod.product._id.toString() === idProd)
            
            if (indexInCart !== -1) {//Si el producto está en el carrito, actualizo la cantidad
                cart.products[indexInCart].quantity = quantityProd;
            }else{//Si el prod no está, informo del error
                const error = new Error()
                error.message = `No se encontró el producto con el id: ${idProd} en el carrito.`
                error.name='Product not found in cart'
                throw error
            }

            //Marcamos la propiedad 'products' como modificada antes de guardar
            cart.markModified('products')

            return await cart.save();
        } catch (error) {
            throw error
        }
    }

    async deleteProductFromCart(idCart, idProd){
        try {
            if(!idCart || !idProd){
                const error = new Error()
                error.message = `Parametros invalidos`
                error.name='Parametros invalidos'
                throw error
            }

            const cart = await cartsModel.findById(idCart)
            if(!cart){
                const error = new Error()
                error.message = `No se encontró el carrito con el id: ${idCart}`
                error.name='Cart not found'
                throw error
            }

            //Veo si en el carrito está el producto
            const indexInCart = cart.products.findIndex((prod) => prod.product._id.toString() === idProd)
    
            if (indexInCart !== -1) {//Si el producto está en el carrito, lo borro
                cart.products.splice(indexInCart, 1);
            }else{//Si el prod no está, evio mensaje
                const error = new Error()
                error.message = `El  producto con ID "${idProd}" no se encuentra en este carrito.`
                error.name='Product not found in cart'
                throw error
            }
            
            //Marcamos la propiedad 'products' como modificada antes de guardar
            cart.markModified('products')
            return await cart.save()
            
        } catch (error) {
            throw error
        }
    }

    async deleteCart(idCart){
        try {
            const cart = await cartsModel.findByIdAndDelete(idCart);
            if ( !cart ) {//Valido que el carrito exista
                const error = new Error()
                error.message = `No se encontró el carrito con el id: ${idCart}`
                error.name='Cart not found'
                throw error
            }
            return cart

        } catch (error) {
           throw error
        }
    }
}

module.exports = CartsRepository ;