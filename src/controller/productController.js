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

            return res.status(200).send(arrayProductos)
        } catch (error) {
            return res.status(500).send(`Error al mostrar los productos con faker. Error: ${error}`)
        }
    }

    //ruta ¨/¨, metodo GET
    async getProducts(req, res){
        try {
            //Guardamos los query (recordar que el query se levantan con ?limit=5&page=2...)
            let { limit, page, priceOrder, ...queryObject} = req.query
    
            //Validacion de parametros de consulta
            if (limit <= 0 || page <= 0) {
                return res.status(400).json({stauts:400, message: "Solicitud incorrecta. Los parámetros de consulta no son válidos."});
            }

            //en limit, page y priceOrder, uso ternarios, si exsite el valor correcto, lo uso, de lo contrario, le doy un valor por defecto
            //aunque ya estaban creados, con esto agrego mas validaciones
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

            if (!arrayProductos || arrayProductos.length === 0) {
                return res.status(404).json({status:404, message: "No se encontraron productos."});
            }

            return res.status(200).send(arrayProductos)
    
        } catch (error) {
            // Por defecto, si ocurre un error no especificado
            return res.status(500).json({status:500,
                message: `Error interno del servidor. No se pudieron obtener los productos. Error: ${error}`
            });
        }
    }

    //ruta ¨/:pid¨, metodo GET
    async getProductById(req, res){
        try{
            //Me guardo el id 
            let pid = req.params.pid

            if (!pid){
                return res.status(400).send({status:400, message: 'Solicitud incorrecta. El parámetros de consulta no es válido.' })
            } 

            const prod = await productRepository.getProductById(pid);
    
            if(!prod){
                return res.status(404).send(`No se encontró el producto con ID: ${pid}.`)
            }

            return res.status(200).send(prod);
        }catch(error){
            return res.status(500).send({status:500 ,message:`Error al mostrar el producto de ID ${req.params.pid}. Error (${error})`})
        }
    }

    //ruta ¨/admin¨, metodo POST
    async addProductAdmin(req, res){
        try {
            const rol = req.user.rol;
            if(!rol){
                return res.status(401).send({status:401, message:`Se requiere autenticación`})
            }
  
            if ((req.user.rol !== 'admin')){
                return res.status(403).send({status:403, message:'No tienes permisos para agregar un producto.'})
            }

            //Verificación de los datos desde middleware.
            
            //Se crea la owner
            req.body.owner = (rol === 'premium') ? req.user.correo : 'admin';
            //let {title, description, categoria, idCategoria, thumbnail, price, onSale, descuento, stock, alt, status=true, code, owner } = req.body;
            
            await productRepository.addProduct(req.body)
                .then(respuesta => res.status(201).redirect("/admin"))
        } catch (error) {
            return res.status(500).send({status:500, message:`Error al subir el nuevo producto. Error: ${error}`})
        }
    }

    //ruta ¨/premium¨, metodo POST
    async addProductPremium(req, res){
        try {
            const rol = req.user.rol;
            if(!rol){
                return res.status(401).send({status:401, message:`Se requiere autenticación`})
            }

            if ((req.user.rol !== 'premium')){
                return res.status(403).send({status:403, message:'No tienes permisos para agregar un producto.'})
            }

            //Verificación de los datos desde middleware.

            //Se crea la owner
            req.body.owner = (rol === 'premium') ? req.user.correo : 'admin';
            //let {title, description, categoria, idCategoria, thumbnail, price, onSale, descuento, stock, alt, status=true, code, owner } = req.body;
            
            await productRepository.addProduct(req.body)
                .then(respuesta => res.status(201).redirect("/premiumProducts"))
        } catch (error) {
            return res.status(500).send({status:500, message:`Error al subir el nuevo producto. Error: ${error}`})
        }
    }

    //ruta ¨/:pid¨, metodo PUT
    async updateProduct(req, res){
        try {
            let pid = req.params.pid;

            if (!pid){
                return res.status(400).send({status:400, message: 'Solicitud incorrecta. El parámetros de consulta no es válido.' })
            } 
    
            //Validaciones de los campos de req.body en handleErrorCrearProducto.
            //let {title, description, categoria, idCategoria, thumbnail, price, onSale, descuento, stock, alt, status=true, code } = req.body;

            const prod = await productRepository.updateProduct(pid ,req.body);                
            return res.status(200).send(prod);
        } catch (error) {
            if(error.name === 'Product not found'){
                res.status(404).send({status:404, message: error.message})
            }
            res.status(500).send({status:500, message:`Error al actualizar el producto. ERROR ${error}`})
        }
    }

    //ruta ¨/:pid¨, metodo DELETE
    async deleteProduct(req, res){
        try {
            
            let pid = req.params.pid;
            if (!pid){
                return res.status(400).send({status:400, message: 'Solicitud incorrecta. El parámetros de consulta no es válido.' })
            } 

            const prod = await productRepository.getProductById(pid);
            if (!prod){
                return res.status(404).send({status:404, message: `No se encontró el producto de id: ${pid}`})
            } 
            const owner = prod.owner;

            if (owner === 'admin'){
                return await productRepository.deleteProduct(pid)
                    .then(respuesta => res.status(200).send(respuesta))
            }

            if(owner === req.user.correo){
                return await productRepository.deleteProduct(pid)
                    .then(respuesta => res.status(200).send(respuesta))
            }
            return res.status(403).send({status:403, message:'No tienes permisos para eliminar un producto.'})

        }catch(error){
            return res.status(500).send(`Error al eliminar el producto. ERROR ${error}`)
        }
    }

    //ruta ¨/premium/:pid¨, metodo DELETE
    async deleteProductPremium(req, res){
        try {
            let pid = req.params.pid;
            if (!pid){
                return res.status(400).send({status:400, message: 'Solicitud incorrecta. El parámetros de consulta no es válido.' })
            } 

            //Autenticación desde middleware

            const prod = await productRepository.getProductById(pid)
            if (!prod){
                return res.status(404).send({status:404, message: `No se encontró el producto de id: ${pid}`})
            }
            const owner = prod.owner;
            console.log(prod)

            if (owner === 'admin'){
                return await productRepository.deleteProduct(pid)
                    .then(respuesta => res.status(200).redirect('/premiumProducts'))
            }
            if(owner === req.user.correo){
                return await productRepository.deleteProduct(pid)
                    .then(respuesta => res.status(200).redirect('/premiumProducts'))
            }
            return res.status(403).send({status:403, message:'No tienes permisos para eliminar un producto.'})()

        }catch(error){
            return res.status(500).send({status:500, message:`Error al eliminar el producto. ERROR ${error}`})
        }
    }
}

module.exports = ProductController;