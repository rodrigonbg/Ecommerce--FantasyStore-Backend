const fs = require("fs");

module.exports = class ProductManager {
    static IdProduct = 10; //pertenece a la calse, asi que guarda el ultimo id usado

    constructor (path) {
        this.path = path;
        this.products = []
    }
    
    async addProduct(Objeto){
        try {
            //Leo el array de objetos 
            const products = await this.readProducts();
    
            //Desestructuro el objeto para hacer las validaciones.
            let {title, description, price, thumbnail, code, status = true, stock} = Objeto;
    
            //valido campos no vacios y que code no se repita
            if(!title || !description || !price || !thumbnail || !code || !stock){
                return ('Deben completarse todos los campos.\n');
            }else if (products.some(prod => prod.code === code)){
                return ('El código debe ser único.\n');
            }else{
                const newProduct ={
                    id : ++ProductManager.IdProduct,
                    title: title,
                    description: description,
                    price: price,
                    thumbnail: thumbnail,
                    code: code,
                    status: status,
                    stock: stock
                }
    
                //Agrego el objeto al array
                await products.push(newProduct);
    
                //Guardo el array de productos en un archivo JSON
                const resp = await this.setProducts(products)
                    .then(()=> (`Producto nuevo (${title}) agregado con exito!!`))
                    .catch((err) => (`ERROR: ${err}`))
                return resp
            }
        } catch (error) {
            return (`Error al agregar el nuevo producto.`)
        }
    }
    
    async readProducts () {
        if (fs.existsSync(this.path)){
            const arrayProductos = await fs.promises.readFile(this.path, 'utf-8')
                .then(data => JSON.parse(data))
                .catch(err => (`Ocurrió un error durante la lectura del archivo: (${err})`))
            return arrayProductos
        }else{
            return (`No se encontró el archivo en la ruta especificada (${this.path})`)
        }
    }

    async readProductsbyId(id) {
        if (fs.existsSync(this.path)){
            const producto = await fs.promises.readFile(this.path, 'utf-8')
                .then(data => JSON.parse(data))
                .then(res => res.find(item => item.id == +id))
                .catch((err => (`Ocurrió un error durante la lectura del archivo: (${err})`)))
            return producto
        }else{
            return (`No se encontró el archivo en la ruta especificada (${this.path})`)
        }
    }

    async setProducts(arrayProducts){
        await fs.promises.writeFile(this.path, JSON.stringify(arrayProducts, null, 2))
    }

    async deleteProduct(id){
        try {
            //traigo los productos
            const productos = await this.readProducts()

            //Guardo el indice del producto a eliminar
            const index = await productos.findIndex(item => item.id == id)
  
            if (index !== -1){
                //Elimino el producto y lo guardo en el array de la clase
                await productos.splice(index, 1); 
                this.products = productos

                //Guardo el array de productos sin el eliminado en el archivo JSON
                const resp = await this.setProducts(this.products)
                    .then(()=> (`producto con id: ${id} borrado`))
                return resp
            }else{
                return(`No se encontró un producto con el id: ${id}`)
            }

        } catch (error) {
            return(`Error al eliminar el producto: ${error}`)
        }
    }

    async updateProduct(id, updatedProd){
        try{
            //Desestructuro el producto actualizado y creo un nuevo objeto para agregarlo al array de productos.
            let {title, description, price, thumbnail, code, status=true, stock} = updatedProd;
            const updatedProduct = {
                id : id,
                title: title,
                description: description,
                price: price,
                thumbnail: thumbnail,
                code: code,
                status : status,
                stock: stock
            }

            //traigo la lista de productos del arvhivo JSON
            const updatedProducts = await this.readProducts()
    
            //Busco el index del elemento con el id y lo sobreescribo en el array
            const index = await updatedProducts.findIndex((item)=> item.id == id)    
            if (index != -1){
                updatedProducts[index] = updatedProduct
            }else{
                return `Producto con ID ${id} no encontrado`
            }
            
            //actiualizo el array de la clase
            this.products = updatedProducts;
    
            //Guardo el array de productos actualizdo en un archivo JSON
            const resp = await this.setProducts(this.products)
                .then(()=>`Producto con ID ${id} actualizado!!`)
            return resp

        }catch(err){
            return(`Error al actualizar el producto: ${err}`)
        }
    }
}

