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
        const {title, descripcion, categoria, idCategoria, thumbnail, price, onSale, descuento, stock, alt, status, code} = req.body

        //Si no existe, true para entrar al if, si existe y no cumple con el typo requerido, tambien true
        const Title = title? typeof(title) !== 'string' : true
        const Descripcion = descripcion? typeof(descripcion) !== 'string' : true 
        const Categoria = categoria? typeof(categoria) !== 'string' : true
        const IdCategoria = idCategoria? typeof(idCategoria) !== 'string' : true
        const Thumbnail = thumbnail? !Array.isArray(thumbnail) : true
        const Price = price? typeof(price) !== 'number' : true
        const OnSale = typeof(onSale) !== 'boolean'
        const Descuento = descuento? typeof(descuento) !== 'number' : true
        const Stock = stock? typeof(stock) !== 'number' : true
        const Alt = alt? typeof(alt) !== 'string' : true
        const Status = typeof(status) !== 'boolean'
        const Code = code? typeof(code) !== 'string' : true
    
        if (Title || Descripcion || Categoria || IdCategoria || Thumbnail || Price || OnSale || Descuento || Stock || Alt || Status || Code){
            throw CustomError.crearError({
                nombre: "Crear Usuario",
                causa: infoErrorCrearProducto({title, descripcion, categoria, idCategoria, thumbnail, price, onSale, descuento, stock, alt, status, code}),
                mensaje: "Error en los datos para crar un Producto.",
                codigo: idError.TIPO_INVALIDO
            });
        }
        next()
    }catch (error) {
        res.send(error)
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
        const Rol = rol? (rol !== 'admin' || rol !== 'usuario'): true
        const Cart = cart? false : true
    
        if (First_name || Email || Password || Cart || Rol || Last_name || Age){
            throw CustomError.crearError({
                nombre: "Crear Producto",
                causa: infoErrorCrearUser({first_name, last_name, email, age, password, cart, rol}),
                mensaje: "Error en los datos para crar un usuario.",
                codigo: idError.TIPO_INVALIDO
            });
        }
        next()
    } catch (error) {
        res.send(error)
    }
}

const handleErrorAgregarACarrito = async (req, res, next)=>{
    try {
        const {pid, cid} = req.params
    
        //Si no existe, true para entrar al if 
        const Pid = pid? typeof(pid) !== 'string': true
        const Cid = cid? typeof(cid) !== 'string' : true 
        
        if (Cid || Pid){
            throw CustomError.crearError({
                nombre: "Agregar a carrito",
                causa: infoErrorAgregarACarrito(pid, cid),
                mensaje: "Error en los datos para agregar un prod a un carrito.",
                codigo: idError.TIPO_INVALIDO
            });

        }else{
            //Devuelven el elemento o un strign. 
            const cart = await cartsRepository.getCartbyId(cid);
            const prod = await productsRepository.getProductById(pid);
            
            //Si el retorno es valido, true (si no existe, false. Si existe y no es string, true)
            const Cart = !cart? false : typeof(cart) !== 'string'
            const Prod = !prod? false : typeof(prod) !== 'string'

            //Si uno no es valido, entro al if            
            if(!Cart || !Prod){
                throw CustomError.crearError({
                    nombre: "Agregar prod al carrito",
                    causa: infoErrorAgregarACarrito(pid, cid, Prod, Cart),
                    mensaje: "No se encontraron documentos en la BD para los datos recibidos",
                    codigo: idError.BD
                });
            }
        }            
        next()
        
    } catch (error) {
        res.send(error)
    }
}

module.exports = {handleErrorCrearProducto, handleErrorCrearUser, handleErrorAgregarACarrito}


