const productModel = require("../models/products.models.js")

class ProductRepository{

    async addProduct(Objeto){
        try {
            //Desestructuro el objeto para hacer las validaciones.
            let {title, description, categoria, idCategoria, price, thumbnail, onSale, descuento, code, status = true, stock, alt, owner} = Objeto;
    
            //valido campos no vacios y que code no se repita
            if(!title || !description || !categoria || !idCategoria || !price || !thumbnail || !code || !stock){
                return ('Deben completarse todos los campos.\n');
            }
            
            const existeProd = await productModel.findOne({code: code});
            if (existeProd){
                return ('El código debe ser único.\n');
            }else{
                const newProduct = new productModel({
                    title: title,
                    description: description,
                    categoria: categoria,
                    idCategoria: idCategoria,
                    thumbnail: thumbnail,
                    price: price,
                    onSale: onSale,
                    descuento: descuento,
                    stock: stock,
                    code: code,
                    status: status,
                    alt: alt? alt: title
                })

                owner? newProduct.owner = owner : newProduct.owner ='admin'
                
                //cuando tengo e nuevo producto, lo guardo
                const respuesta = await  newProduct.save(); 
                return `Producto agregado: ${respuesta}`
            }
        } catch (error) {
            return (`Error al agregar el nuevo producto.`)
        }
    }
    
    async getProducts ({limit, page, order, queryObject}) {
        try {
            const products = await productModel.paginate(
                queryObject,
                {
                    limit, 
                    page, 
                    sort: order
                });
            return products;
        } catch (error) {
            throw error;
        }    
    }

    async getProductsByOwner (email) {
        try {
            const products = await productModel.find({ owner: email })
            return products;
        } catch (error) {
            throw error;
        }    
    }

    async getProductById(id) {
        try {
            const product = await productModel.findById(id);
            return product
        } catch (error) {
            throw error
        }
    }

    async deleteProduct(id){
        try {
            const deletedProd = await productModel.findByIdAndDelete(id) 

            if (!deletedProd){
                return(`No se encontró un producto con el id: ${id}`)
            }else{
                return `Producto Eliminado ${deletedProd}`
            }
        } catch (error) {
            throw error
        }
    }

    async updateProduct(id, updatedProd){
        try{
            //Desestructuro el producto actualizado y creo un nuevo objeto para agregarlo al array de productos.
            let {title, description, categoria, idCategoria, price, thumbnail, onSale, descuento, code, status = true, stock, alt} = updatedProd;

            const updatedProduct ={
                title: title,
                description: description,
                categoria: categoria,
                idCategoria: idCategoria,
                thumbnail: thumbnail,
                price: price,
                onSale: onSale,
                descuento: descuento,
                stock: stock,
                code: code,
                status: status,
                alt: alt
            }

            const updated = await productModel.findByIdAndUpdate(id, updatedProduct)
     
            if (!updated){
                const error = new Error()
                error.message = `No se encontró un producto con el id: ${id}`
                error.name('Product not found')
                throw error
            }
            return updated;

        }catch(error){
            throw error
        }
    }

    async subtractStock(id, amountToSubtract){
        try{

            //TRaigo el prod de la bd y lo desestructuro
            let {title, description, categoria, idCategoria, price, thumbnail, onSale, descuento, code, status, stock, alt} = await this.getProductById(id);

            if(stock - amountToSubtract >=0){
                const updatedProduct ={
                    title: title,
                    description: description,
                    categoria: categoria,
                    idCategoria: idCategoria,
                    thumbnail: thumbnail,
                    price: price,
                    onSale: onSale,
                    descuento: descuento,
                    stock: stock - amountToSubtract,
                    code: code,
                    status: status,
                    alt: alt
                }

                const updated = await productModel.findByIdAndUpdate(id, updatedProduct)
                if (!updated){
                    return `Producto con ID ${id} no encontrado`
                }else{
                    return `Producto actualizado ${updated}`
                }

            }else{
                throw new Error ('EL stock no es suficiente')
            }

        }catch(error){
            throw error
        }
    }
}
 module.exports = ProductRepository;