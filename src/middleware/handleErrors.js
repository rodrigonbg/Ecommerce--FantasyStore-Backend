const idError = require('../services/errors/idErrors.js')
const CustomError = require('../services/errors/custom-error.js')
const {infoErrorCrearProducto, infoErrorCrearUser, infoErrorAgregarACarrito} = require('../services/errors/info.js')

const CartsRepository = require("../repositories/cart.repository.js");
const cartsRepository = new CartsRepository();
const ProductsRepository = require("../repositories/product.repository.js");
const productsRepository = new ProductsRepository();

//Se ejecutarán antes del controller en las rutas verificando que los datos que lleguen al controller sean validos
const handleErrorCrearProducto = (req, res, next)=>{
    try {
        const {title, description, categoria, idCategoria, price, onSale, descuento, stock, code} = req.body
        //Si no existe, true para entrar al if, si existe y no cumple con el typo requerido, tambien true
        const Title = title? typeof(title) !== 'string' : true
        const Description = description? typeof(description) !== 'string' : true 
        const Categoria = categoria? typeof(categoria) !== 'string' : true
        const IdCategoria = idCategoria? typeof(idCategoria) !== 'string' : true
        const Price = price? typeof(parseInt(price)) !== 'number' : true
        const OnSale = onSale? typeof(JSON.parse(onSale)) !== "boolean" : true
        const Descuento = descuento? typeof(parseInt(descuento)) !== 'number' : true
        const Stock = stock? typeof(parseInt(stock)) !== 'number' : true
        const Code = code? typeof(code) !== 'string' : true
        
        
        if (Title || Description || Categoria || IdCategoria || Price || OnSale || Descuento || Stock || Code){
            console.log('aki',title, description, categoria, idCategoria, price, onSale, descuento, stock, code)
            const error = CustomError.crearError({
                nombre: "Crear Producto",
                causa: infoErrorCrearProducto({title, description, categoria, idCategoria, price, onSale, descuento, stock, code}),
                mensaje: "Error en los datos para crar un Producto.",
                codigo: idError.TIPO_INVALIDO
            });
            
            return res.status(400).send({status:400, message: error.toString()})
        }
        next()
    }catch (error) {
        next(error)
    }
}

const handleErrorCrearUser = (req, res, next)=>{
    try {
        const {first_name, last_name, email, age, password, cart, rol} = req.body
        
        //si el valor no exite, como no es necesario, false. en el caso de existir veo que sea del  typo q quiero
        const Age = !age? typeof(age) !== 'number' : false 
        const Last_name = !last_name? typeof(last_name) !== 'string' : false 
        
        //Si no existe, true para entrar al if 
        const First_name = first_name? typeof(first_name) !== 'string' : true
        const Email = email? typeof(email) !== 'string' : true 
        const Password = password? typeof(password) !== 'string' : true
        //const Rol = rol? (rol !== 'admin' || rol !== 'usuario'): true
        //const Cart = cart? false : true
        
        if (First_name || Email || Password || Last_name || Age){//No me fijo en el rol y el cart porqe se agregan en el apso siguiente por local passport
            const error = CustomError.crearError({
                nombre: "Crear User",
                causa: infoErrorCrearUser({first_name, last_name, email, age, password, cart, rol}),
                mensaje: "Error en los datos para crar un usuario.",
                codigo: idError.TIPO_INVALIDO
            });
            return res.status(400).send({status:400, message: error.toString()})
        }
        
        next()
    } catch (error) {
        next(error)
    }
}

const handleErrorAgregarACarrito = async (req, res, next)=>{
    try {
        const {pid, cid} = req.params
    
        //Si no existe, true para entrar al if 
        const Pid = pid? typeof(pid) !== 'string': true
        const Cid = cid? typeof(cid) !== 'string' : true 
        
        if (Cid || Pid){
            const error = CustomError.crearError({
                nombre: "Agregar a carrito",
                causa: infoErrorAgregarACarrito(pid, cid),
                mensaje: "Error en los datos para agregar un prod a un carrito.",
                codigo: idError.TIPO_INVALIDO
            });
            return res.status(400).send({status:400, message: error.toString()})

        }else{
            //Devuelven el elemento o un strign. 
            const cart = await cartsRepository.getCartbyId(cid);
            const prod = await productsRepository.getProductById(pid);
            
            //Si el retorno es valido, true (si no existe, false. Si existe y no es string, true)
            const Cart = !cart? false : typeof(cart) !== 'string'
            const Prod = !prod? false : typeof(prod) !== 'string'

            //Si uno no es valido, entro al if            
            if(!Cart || !Prod){
                const error = CustomError.crearError({
                    nombre: "Agregar prod al carrito",
                    causa: infoErrorAgregarACarrito(pid, cid, Prod, Cart),
                    mensaje: "No se encontraron documentos en la BD para los datos recibidos",
                    codigo: idError.BD
                });
                return res.status(400).send({status:400, message: error.toString()})
            }
        }            
        next()
        
    } catch (error) {
        next(error)
    }
}

module.exports = {handleErrorCrearProducto, handleErrorCrearUser, handleErrorAgregarACarrito}


