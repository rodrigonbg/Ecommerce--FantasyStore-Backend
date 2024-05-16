const ProductRepository = require("../repositories/product.repository.js");
const productRepository = new ProductRepository();
const UserRepository = require("../repositories/user.repository.js");
const userRepository = new UserRepository();
const generarProducto = require('../utils/mocks.js')

class ProductController {

    getProductsFaker(req, res){
        try {
            //Cargamos el array de productos
            const arrayProductos = []
            for( let i=0 ; i<100 ; i++ ){
                arrayProductos.push(generarProducto())
            }

            return res.send(arrayProductos)
        } catch (error) {
            return res.send(`Error al mostrar los productos con faker. Error: ${error}`)
        }
    }

    //ruta ¨/¨, metodo GET
    async getProducts(req, res){
        try {
            //Guardamos los query (recordar que el query se levantan con ?limit=5&page=2...)
            let { limit, page, priceOrder, ...queryObject} = req.query
    
            //en limit, page y priceOrder, uso ternarios, si exsite el valor correcto, lo uso, de lo contrario, le doy un valor por defecto
            //Unque ya estaban creados, con esto agrego mas validaciones
            limit = parseInt(Number(req.query.limit)? req.query.limit : 10); //si el limit es un unmero y existe, tomo su valor, de lo contrario, por defecto 10
            page = parseInt(Number(req.query.page)? req.query.page : 1); //por defecto tiene que ser 1
            priceOrder = (req.query.priceOrder === 'asc' || req.query.priceOrder === 'des') ? req.query.priceOrder : null // por defecto no hace ordenamiento
    
            //Creo el objeto de orden si es que hay
            let order = {}
            if (priceOrder !== null){
                order = {
                    price : priceOrder === 'asc'? 1 : -1 
                }
            }
    
            //Cargamos el array de productos con los querys, el limiete, la page y el orden
            const arrayProductos = await productRepository.getProducts({queryObject, limit, page, order});
            return res.send(arrayProductos)
    
        } catch (error) {
            return res.send(`Error al mostrar los productos. Error: ${error}`)
        }
    }

    //ruta ¨/:pid¨, metodo GET
    async getProductById(req, res){
        try{
            //Me guardo el id 
            let pid = req.params.pid
    
            //guardo el prod con ese id
            const prod = await productRepository.getProductById(pid);
    
            if(prod){
                return res.send(prod)
            }else{
                return res.send(`El ID: ${pid} del producto es incorrecto.`)
            }
        }catch(error){
            return res.send(`Error al mostrar el producto de ID ${req.params.pid}. Error (${error})`)
        }
    }

    //ruta ¨/¨, metodo POST
    async addProduct(req, res){
        try {
            const rol = req.user.rol;
            console.log(rol)
            if ((req.user.rol === 'usuario')){
                throw ('No tienes permisos para agregar un producto.')
            }
            req.body.owner = (rol === 'premium') ? req.user.correo : 'admin';
            //info del producto desde el body
            //let {title, description, categoria, idCategoria, thumbnail, price, onSale, descuento, stock, alt, status=true, code, owner } = req.body;
            await productRepository.addProduct(req.body)
                .then(respuesta => res.redirect("/realTimeProducts"))
        } catch (error) {
            return res.send(`Error al subir el nuevo producto. Error: ${error}`)
        }
    }

    //ruta ¨/:pid¨, metodo PUT
    async updateProduct(req, res){
        try {
            //Me guardo el id 
            let pid = req.params.pid;
    
            //info del producto desde el body
            //let {title, description, categoria, idCategoria, thumbnail, price, onSale, descuento, stock, alt, status=true, code } = req.body;
            await productRepository.updateProduct(pid ,req.body)
                .then(respuesta => res.send(respuesta))
        } catch (error) {
            res.send(`Error al actualizar el producto. ERROR ${error}`)
        }
    }

    //ruta ¨/:pid¨, metodo DELETE
    async deleteProduct(req, res){
        try {
            //Me guardo el id 
            let pid = req.params.pid;
            await productRepository.deleteProduct(pid)
                .then(respuesta => res.send(respuesta))
    
        }catch(error){
            return res.send(`Error al eliminar el producto. ERROR ${error}`)
        }
    }

}

module.exports = ProductController;