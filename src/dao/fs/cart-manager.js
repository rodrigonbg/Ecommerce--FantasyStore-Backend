const fs = require("fs");

module.exports = class CartManager {
    static IdCart = 3; //pertenece a la calse, asi que guarda el ultimo id usado

    constructor (path) {
        this.path = path;
        this.carts = []
    }

    async setCarts(arrayCarts){
        await fs.promises.writeFile(this.path, JSON.stringify(arrayCarts, null, 2))
            .catch(err => (`Ocurrió un error al guardar los carritos: ${err}`))
    }

    async addNewCart(products = []){ // Por defecto se crea vacío

        //Creo el nuevo carrito
        const newCart ={
            id : ++CartManager.IdCart,
            products : products 
        }

        //actualizo el array de carritos
        const updatedArrayCarts = await this.readCarts();
        await updatedArrayCarts.push(newCart);
        this.carts = updatedArrayCarts;

        // Actualizo el JSON
        const resp = await this.setCarts(this.carts)
            .then(()=> `Carrito creado con exito`);
        return resp
    }

    /* Falta ver que el prod exista ----------------------------------------------------------------------------------------------------------*/
    async addProductToCart(idCart, idProd, cantidadProd=1){
        //Para agregar un producto al carrito, le paso directamente el id del carrito, del prod y la cantidad que por defecto es 1
        //Si el prod ya está en el carrito, actualizo la acantidad. De lo contrario lo agrego.

        try {
            //traigo todos los carritos
            const updatedCarts = await this.readCarts();
    
            //Guardo el carrito especifico, el index del carrito y el index del prod en el caso de que ya exista
            const updatedCart = await this.readCartbyId(idCart);
            const indexCart = await updatedCarts.findIndex((cart) => cart.id == +idCart)
            const indexProd = await updatedCart.products.findIndex((item) => item.id == +idProd);

            console.log(indexProd)

            if(indexProd != -1){
                //si el prod ya está en el carrito actualizo la cantidad
                let nuevaCantidad = cantidadProd + updatedCart.products[indexProd].quantity;
                updatedCarts[indexCart].products[indexProd].quantity = nuevaCantidad
                //await this.updateProductAmountInCart(idCart, idProd, nuevaCantidad);
            }else{
                //si el prod no está en el carrito, lo agrego
                const newProduct ={
                    id : idProd,
                    quantity: cantidadProd
                }

                //actualizo el carrito y luego el array de carritos
                updatedCart.products.push(newProduct);
                updatedCarts[indexCart] = updatedCart;
            }

            //actualizo el array de la clase
            this.carts = updatedCarts;
    
            //Guardo el array de carritos actualizdo en un archivo JSON
            const resp = await this.setCarts(this.carts)
                .then(()=> (`Producto de ID ${idProd} agregdo con exito al carrito de ID ${idCart}`))
            return resp
        } catch (error) {
            return (`Error al agregar producto al carrito. Error: ${error}`)
        }
    }

    async readCarts () {
        if (fs.existsSync(this.path)){
            const carritos = await fs.promises.readFile(this.path, 'utf-8')
                .then(data => JSON.parse(data))
                .catch(err => (`Ocurrió un error durante la lectura del archivo de carritos: (${err})`))
            return carritos
        }else{
            return(`No se encontró el archivo del Carrito en la ruta especificada (${this.path})`)
        }
    }

    async readCartbyId(id) {
        if (fs.existsSync(this.path)){
            const carrito = await fs.promises.readFile(this.path, 'utf-8')
                .then(data => JSON.parse(data))
                .then(res => res.find(cart => cart.id == +id))
                .catch(err => (`Ocurrió un error durante la lectura del archivo de carritos: (${err})`))
            return carrito
        }else{
            return(`No se encontró el carrito de ID ${id} en la ruta especificada (${this.path})`)
        }
    }

    async deleteCart(idCart){
        try {
            //traigo los productos
            const updatedCarts = await this.readCarts()

            //Guardo el indice del producto a eliminar
            const index = await updatedCarts.findIndex(cart => cart.id == +idCart)
  
            if (index !== -1){
                //Elimino el carrito especifico y lo guardo en el array de la clase
                await updatedCarts.splice(index, 1); 
                this.carts = updatedCarts

                //Guardo el array de carritos sin el eliminado en el archivo JSON
                const resp = await this.setCarts(this.carts)
                    .then(()=>(`producto con id: ${idCart} borrado del carrito`))
                return resp
            }else{
                return(`No se encontró un carrito con el id: ${idCart} en el carrito`)
            }

        } catch (error) {
            return(`Error al eliminar el carrito. Error: ${error}`)
        }
    }


    /*  
    async updateProductAmountInCart(idCart, idProd, nuevaCantidad){
        try{

            //Me guardo todos los carritos
            const updatedCarts = await this.readCarts();
            
            //Me guardo el carrito especifico y su index
            const updatedCart = await this.readCartbyId(idCart);
            const indexCart = await updatedCarts.findIndex((cart) => cart.id == +idCart);

            //Busco el index del prod en el carrito con el id y actualizo la cantidad
            const indexProd = await updatedCart.products.findIndex((item) => item.id == +idProd);
            updatedCart.products[indexProd].quantity = nuevaCantidad;

            //actualizo el array de carritos con el carrito actualizado
            updatedCarts[indexCart] = updatedCart;

            //actiualizo el array de la clase
            this.carts = updatedCarts;
    
            //Guardo el array de carritos actualizdo en un archivo JSON
            await this.setCarts(this.carts)

        }catch(err){
            console.log(`Error al actualizar la cantidad del producto ${idProd} en el carrito de ID ${idCart}. Error: ${err}`)
        }
    }
    */
}