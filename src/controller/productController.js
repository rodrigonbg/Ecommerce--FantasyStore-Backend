const ProductRepository = require("../repositories/product.repository.js");
const UserRepository = require("../repositories/user.repository.js");
const { sendProductDeleted } = require("../services/emailsManager.js");
const generarProducto = require('../utils/mocks.js')
const configObject = require('../config/dotenv.config.js');

const productRepository = new ProductRepository();
const userRepository = new UserRepository();

class ProductController {

    getProductsFaker(req, res){
        try {
            const arrayProductos = []
            for( let i=0 ; i<100 ; i++ ){
                arrayProductos.push(generarProducto())
            }
            return res.status(200).send(arrayProductos)
        } catch (error) {
            return res.status(500).json({status:500, message: `${error}`});
        }
    }

    //ruta ¨/¨, metodo GET
    async getProducts(req, res){
        try {
            //Guardamos los query (recordar que el query se levantan con ?limit=5&page=2...)
            let { limit, page, priceOrder, ...queryObject} = req.query
    
            if (limit <= 0 || page <= 0) {
                return res.status(400).json({stauts:400, message: "Solicitud incorrecta. Los parámetros de consulta no son válidos."});
            }

            limit = parseInt(Number(req.query.limit)? req.query.limit : 40); //si el limit es un numero y existe, tomo su valor, de lo contrario, por defecto 40
            page = parseInt(Number(req.query.page)? req.query.page : 1);
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
            return res.status(500).json({status:500, message: `${error}`});
        }
    }

    //ruta ¨/premiumProducts¨, metodo GET
    async getProductsOwner(req, res){
        try {
            const owner = (req.user.correo === configObject.admin_email)? 'admin' : req.user.correo;
            if(!owner){
                return res.status(401).json({status:401, message: `No hay usuario logueado`});
            }

            const arrayProductos = await productRepository.getProductsByOwner(owner);

            return res.status(200).send(arrayProductos)
    
        } catch (error) {
            return res.status(500).json({status:500, message: `${error}`});
        }
    }

    //ruta ¨/:pid¨, metodo GET
    async getProductById(req, res){
        try{
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
            return res.status(500).json({status:500, message: `${error}`});
        }
    }
    
    //ruta ¨/admin¨, metodo POST
    async addProductAdmin(req, res){
        try {
            const files = req.files
            let filesReferences = [];

            files.forEach(file => {
                filesReferences.push(`/products/${file.filename}`)
            });
            req.body.thumbnail = filesReferences;

            const rol = req.user.rol;
            if(!rol){
                return res.status(401).send({status:401, message:`Se requiere autenticación`})
            }
  
            if ((req.user.rol !== 'admin')){
                return res.status(403).send({status:403, message:'No tienes permisos para agregar un producto.'})
            }

            //Verificación de los datos en el body desde middleware.
            req.body.owner = (rol === 'premium') ? req.user.correo : 'admin';
            await productRepository.addProduct(req.body);

            return res.status(201).redirect("/admin")
        } catch (error) {
            return res.status(500).send({status:500, message:`${error}`})
        }
    }

    //ruta ¨/premium¨, metodo POST
    async addProductPremium(req, res){
        try {
            const files = req.files
            let filesReferences = [];
            files.forEach(file => {
                filesReferences.push(`/products/${file.filename}`)
            });
            req.body.thumbnail = filesReferences;

            const rol = req.user.rol;
            if(!rol){
                return res.status(401).send({status:401, message:`Se requiere autenticación`})
            }

            if ((req.user.rol !== 'premium')){
                return res.status(403).send({status:403, message:'No tienes permisos para agregar un producto.'})
            }

            //Verificación de los datos en el body desde middleware.
            req.body.owner = (rol === 'premium') ? req.user.correo : 'admin';
            await productRepository.addProduct(req.body)
            return res.status(201).redirect("/premiumProducts")
        } catch (error) {
            return res.status(500).send({status:500, message:`${error}`})
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
            return res.status(500).json({status:500, message: `${error}`});
        }
    }

    //ruta ¨/:pid¨, metodo DELETE
    async deleteProductAdmin(req, res){
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

            if (owner === 'admin'){//Elimino producto de admin
                return await productRepository.deleteProduct(pid)
                    .then(respuesta => res.status(200).redirect('/admin'))
            }

            return await productRepository.deleteProduct(pid)//Elimino producto de usuario
                .then(async ()=> {
                    const user = await userRepository.getUserbyEmail(owner);
                    sendProductDeleted(owner, user.first_name, user.last_name, prod)
                })
                .then(respuesta => res.status(200).redirect('/admin'))

        }catch(error){
            return res.status(500).json({status:500, message: `${error}`});
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
            if(owner === req.user.correo){
                    return await productRepository.deleteProduct(pid)
                    .then(async ()=> {
                        const user = await userRepository.getUserbyEmail(owner);
                        sendProductDeleted(owner, user.first_name, user.last_name, prod)//Mail al usuario
                    })
                    .then(respuesta => res.status(200).redirect('/premiumProducts'))
            }
            
            return res.status(403).send({status:403, message:'No tienes permisos para eliminar un producto.'})()

        }catch(error){
            return res.status(500).json({status:500, message: `${error}`});
        }
    }
}

module.exports = ProductController;