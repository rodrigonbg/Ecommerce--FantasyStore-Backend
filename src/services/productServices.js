const productModel = require("../models/products.models.js")

class ProductServices{

    async addProduct(Objeto){
        try {
            //Desestructuro el objeto para hacer las validaciones.
            let {title, description, categoria, idCategoria, price, thumbnail, onSale, descuento, code, status = true, stock, alt} = Objeto;
    
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
                    alt: alt
                })

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
            return (`Error al obtener los productos.`)
        }    
    }

    async getProductById(id) {
        try {
            const product = await productModel.findById(id);

            if (!product){
                return `No se encontró el producto con id ${id}`
            }else{
                return product
            }
        } catch (error) {
            return (`Error al obtener el producto.`)
        }
    }

    async deleteProduct(id){
        try {
            const deletedProd = await ProductsModel.findByIdAndDelete(id) 

            if (!deletedProd){
                return(`No se encontró un producto con el id: ${id}`)
            }else{
                return `Producto Eliminado ${deletedProd}`
            }
        } catch (error) {
            return(`Error al eliminar el producto: ${error}`)
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
                return `Producto con ID ${id} no encontrado`
            }else{
                return `Producto actualizado ${updated}`
            }
        }catch(err){
            return(`Error al actualizar el producto: ${err}`)
        }
    }
}
 module.exports = ProductServices;