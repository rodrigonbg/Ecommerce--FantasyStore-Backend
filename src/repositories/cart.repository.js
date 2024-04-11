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
                .then((cart) => `carrito  guardado con id ${cart._id}`) 
            return respuesta
        } catch (error) {
            return `Error al crear el nuevo carrito de compras. ${error}`
        }
    }

    async getCarts() {
        try {
            return await cartsModel.find()
        } catch (error) {
            return `Ocurrio un error al obtener los carritos. ${error}`
        }
    }

    async getCartbyId(id) {
        try {
            const cart = await cartsModel.findById(id)

            if(!cart){
                return `No existe un carrito de compra asociado al ID ${id}`
            }else{
                return cart
            }
        } catch (error) {
            return `Ocurrio un error al obtener el carrito. ${error}`
        }
    }

    async addProductToCart(idCart, idProd, quantityProd=1){
        //Para agregar un producto al carrito, le paso directamente el id del carrito, del prod y la cantidad que por defecto es 1
        //Si el prod ya está en el carrito, actualizo la acantidad. De lo contrario lo agrego.

        try {
            //me traigo el carrito y el producto
            const cart = await cartsModel.findById(idCart)
            const prod = await productsModel.findById(idProd)

            if ( !cart ) {//Valido que el carrito exista
                return `ÈL carrito de ID "${idCart}" no existe.`;
            }else if(!prod){//Valido que el producto tambien exista
                return `El producto de ID "${idProd}" no existe.`;
            }else if (prod.status != true){
                return `Este producto se encuentra inactivo.`;
            }

            //Veo si en el carrito está el producto
            const indexInCart = cart.products.findIndex((prod) => prod.product._id.toString() === idProd)
            
            if (indexInCart !== -1) {//Si el producto está en el carrito, incremento en la cantidad q por defecto es 1
                cart.products[indexInCart].quantity += quantityProd;
            
            }else{//Si el prod no está, lo creo y lo pusheo
                cart.products.push({product: idProd, quantity: quantityProd})
            }

            //Marcamos la propiedad 'products' como modificada antes de guardar
            cart.markModified('products')

            //Finalmente guardo el carrito actualizado
            await cart.save();
            return `Carrito actualizado`
        } catch (error) {
            return (`Error al agregar producto al carrito. Error: ${error}`)
        }
    }

    async updateProductsWithArrayInCart(idCart, arrayProds=[]){
        //Por defecto, el array de prods es vacío
        try {
            //me traigo el carrito y el producto
            const cart = await cartsModel.findById(idCart)

            if ( !cart ) {//Valido que el carrito exista
                return `ÈL carrito de ID "${idCart}" no existe.`;
            }
            
            //actualizo el carrito
            cart.products = arrayProds;

            //Marcamos la propiedad 'products' como modificada antes de guardar
            cart.markModified('products')

            //Finalmente guardo el carrito actualizado
            await cart.save();
            return `Carrito actualizado`
        } catch (error) {
            return (`Error al agregar producto al carrito. Error: ${error}`)
        }
    }

    async updateQuantityOfProdInCart(idCart, idProd, quantityProd){
        try {
            //me traigo el carrito y el producto
            const cart = await cartsModel.findById(idCart)
            const prod = await productsModel.findById(idProd)

            if ( !cart ) {//Valido que el carrito exista
                return `ÈL carrito de ID "${idCart}" no existe.`;
            }else if(!prod){//Valido que el producto tambien exista
                return `El producto de ID "${idProd}" no existe.`;
            }else if (prod.status != true){
                return `Este producto se encuentra inactivo.`;
            }else if(!quantityProd){
                return `Debe ingresar una cantidad de producto`;
            }

            //Veo si en el carrito está el producto
            const indexInCart = cart.products.findIndex((prod) => prod.product._id.toString() === idProd)
            
            if (indexInCart !== -1) {//Si el producto está en el carrito, actualizo la cantidad
                cart.products[indexInCart].quantity = quantityProd;
            }else{//Si el prod no está, informo del error
                return  `No se ha encontrado el producto de ID "${idProd}" en su carrito.`
            }

            //Marcamos la propiedad 'products' como modificada antes de guardar
            cart.markModified('products')

            //Finalmente guardo el carrito actualizado
            await cart.save();
            return `Cantidad actualizada`
        } catch (error) {
            return (`Error al agregar producto al carrito. Error: ${error}`)
        }
    }

    async deleteProductFromCart(idCart, idProd){
        try {
            //me traigo el carrito y el producto
            const cart = await cartsModel.findById(idCart)

            //Promero veo que exita el carrito
            if(!cart){
                return `El  carrito con ID "${idCart}" no existe.`
            }else{
                //Veo si en el carrito está el producto
                const indexInCart = cart.products.findIndex((prod) => prod.product._id.toString() === idProd)
    
                if (indexInCart !== -1) {//Si el producto está en el carrito, lo borro
                    cart.products.splice(indexInCart, 1);
                }else{//Si el prod no está, evio mensaje
                    return `El  producto con ID "${idProd}" no se encuentra en este carrito.` 
                }
            }

            //Marcamos la propiedad 'products' como modificada antes de guardar
            cart.markModified('products')

            //Finalmente guardo el carrito actualizado
            await cart.save();
            return `Carrito actualizado`
            
        } catch (error) {
            return (`Error al agregar quitar producto del carrito. Error: ${error}`)
        }
    }

    async deleteCart(idCart){
        try {
            const cart = await cartsModel.findByIdAndDelete(idCart);
            if (!cart){
                return `No  existe un carrito con el ID "${idCart}"`;
            }else{
                return `Carrito de ID: ${idCart} borrado con exito.`
            }
        } catch (error) {
            return(`Error al eliminar el carrito. Error: ${error}`)
        }
    }

    async emptyCart(idCart){
        try {
            const cart = await cartsModel.findById(id);
            if(!cart){
                throw new Error('El carrito no existe.')
            }
            cart.products = [];
            cart.markModified('products')
            await cart.save();
            return `Carrito vaciado`
        } catch (error) {
            return error
        }
    }   


}

module.exports = CartsRepository ;