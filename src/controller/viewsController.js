const ProductRepository = require("../repositories/product.repository.js");
const productRepository = new ProductRepository();

const CartsRepository = require("../repositories/cart.repository.js");
const cartsRepository = new CartsRepository();

const UserProfileDTO = require("../dto/userProfile.dto.js");

class viewsController{

    //Vista de los productos
    //ruta ¨/¨, metodo GET
    async renderProducts(req, res){
        console.log('renderProds ',req.user)
        console.log('renderProds',req.session)
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
    
            //traemos los productos con los querys, el limiete, la page, el orden y todos los atributos de pagginate
            let status = ``
            const products = await productRepository.getProducts({queryObject, limit, page, order})
                                    .then((resp)=> {
                                        status = `success`
                                        return resp
                                    })
                                    .catch((resp)=> {
                                        status = `error`
                                        return resp
                                    });
    
            const payload = products.docs.map(prod => {
                return{
                    title: prod.title,
                    description: prod.descripcion,
                    price:  prod.price,
                    descuento: prod.descuento,
                    id: prod._id,
                    stock:  prod.stock,
                    status: prod.status
                }
            })
    
            // Convertir queryObject (el resto de las queries) en un string para agregarlo al link al cambiar de pagina
            let queryString = Object.keys(queryObject)
                .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(queryObject[key])}`)
                .join('&');
    
            //Creo un array con las paginas y la que está seleccionada para poder renderizar 
            //los numeritos en index
            const arrayPages = []
            for (let i=1; i <= products.totalPages; i++){
                arrayPages.push({
                    page: i, 
                    selected: i===products.page,
                    link: `?limit=${limit}&page=${i}&priceOrder=${priceOrder}&${queryString}`
                })
            }
            //Guardo el ids de los carritos
            const carts = await cartsRepository.getCarts()
            const cartsId = []
            carts.forEach(cart => {cartsId.push(cart._id.toString())})
    
            const resp = {
                status,
                payload,
                totalPages: products.totalPages,
                prevPage: products.prevPage,
                nextPage: products.nextPage,
                page: products.page,
                hasPrevPage: products.hasPrevPage,
                hasNextPage: products.hasNextPage,
                prevLink: (!products.hasPrevPage)? null : `?limit=${limit}&page=${products.prevPage}&priceOrder=${priceOrder}&${queryString}`,
                nextLink: (!products.hasNextPage)? null : `?limit=${limit}&page=${products.nextPage}&priceOrder=${priceOrder}&${queryString}`,
                arrayPages,
                selectedPage: true,
                cartsId: cartsId,
    
                session: req.session.login === true,
            }
            if(req.user){
                resp.user = req.user
                resp.admin = req.user.rol === 'admin'
            }

            //le paso la respuesta al index y lo renderizo
            res.render('index',{info: resp});
            
        } catch (err) {
            res.status(500).json({
                error: `Error al obtener los productos. Error: ${err}`
            })
        }
    }

    
    //Vista del usuario conectado
    //ruta ¨/user¨, metodo GET
    async renderConectedUser(req, res){
        if(req.user){
            const profile = new UserProfileDTO(req.user._id ,req.user.firstName, req.user.lastName, req.user.rol, req.user.correo, req.user.cart);
            res.render( "profile", { user : profile} )
        }else{
            res.send('No hay usuario logueado')
        }
    }
    
    //Vista de los carritos
    //ruta ¨/carts¨, metodo GET
    async renderCarts(req, res){
        try {
            //Traigo los carritos
            const carts = await cartsRepository.getCarts();
    
            //Creo nuevamente el array para renderizar porq handlebars es una ...
            let toRender=[];
            carts.forEach((cart) =>{
    
                let products = []; 
                cart.products.forEach((prod)=>{
                    products.push({
                        title: prod.product.title,
                        price: prod.product.price,
                        onSale: prod.product.onSale == true,
                        descuento: prod.product.descuento,
                        categoria: prod.product.categoria,
                        quantity: prod.quantity
                    })
                })
    
                toRender.push({
                    cartId: cart._id.toString(),
                    products: products
                })
            })
    
            res.render('carts', {carts: toRender});
    
        } catch (err) {
            res.status(500).json({
                error: `Error al obtener los carritoss. Error: ${err}`
            })
        }
    }
    
    //Viste de un carrto
    //ruta ¨/carts/:cid¨, metodo GET
    async renderCart(req, res){
        try {
            //Traigo los carritos
            let cid= req.params.cid;
            const cart = await cartsRepository.getCartbyId(cid);
    
            //Creo nuevamente el objeto para renderizar porq handlebars es una ...
            let products = []; 
            cart.products.forEach((prod)=>{
                products.push({
                    title: prod.product.title,
                    price: prod.product.price,
                    onSale: prod.product.onSale == true,
                    descuento: prod.product.descuento,
                    categoria: prod.product.categoria,
                    quantity: prod.quantity
                })
            })
    
            let toRender={
                cartId: cart._id.toString(),
                products: products
            };
    
            res.render('cart', {cart: toRender});
    
        } catch (err) {
            res.status(500).json({
                error: `Error al obtener los carritoss. Error: ${err}`
            })
        }
    }
    
    //Vista de productos en tiempo real
    //ruta ¨/admin¨, metodo GET
    async renderRealTimeProducts(req, res){
        try {
            //renderizo realTimeProducts
            const rol = req.user.rol;
            res.render('admin',{rol});
    
        } catch (err) {
            res.status(500).json({
                error: `Error al obtener los productos en tiempo real. Error: ${err}`
            })
        }
    }

    async renderPremiumProducts(req, res){
        try {
            //renderizo realTimeProducts
            const prods = await productRepository.getProductsByOwner(req.user.correo);
            
            const products = prods.map(prod => {
                return{
                    title: prod.title,
                    description: prod.descripcion,
                    price:  prod.price,
                    descuento: prod.descuento,
                    id: prod._id,
                    stock:  prod.stock,
                    status: prod.status,
                    owner: prod.owner
                }
            })

            const payload ={
                products,
                user: req.user                
            }
            res.render('premiumProducts',{payload});
    
        } catch (err) {
            res.status(500).json({
                error: `Error al obtener los productos de usuario premium. Error: ${err}`
            })
        }
    }
    
    //Vista de login (iniciar sesion)
    //ruta ¨/loginForm¨, metodo GET
    async renderLoginForm(req, res){
        try {
            if(req.session.login){
                res.send({msg: "Ya hay un usuario registrado"})
            }else{
                //renderizo login
                res.render('loginForm');
            }
    
        } catch (err) {
            res.send(`Error de vista login. Error: ${err}`)
        }
    }
    
    //Vista de singin (registrarse)
    //ruta ¨/singinForm¨, metodo GET
    async renderSinginForm(req, res){
        try {
            if(req.session.login){
                res.send({msg: "Primero debes cerrar la sesión actual para registrarte."})
            }else{
                //renderizo login
                res.render('singinForm');
            }
    
        } catch (err) {
            res.send(`Error de vista sing in. Error: ${err}`)
        }
    }
    
    
    //Vista de 'enviar correo de restablecimiento'
    //ruta ¨/reset-password¨, metodo GET
    async renderResetPassword(req, res){
        try {
            if(req.session.login){
                res.send({msg: "Usted ya tiene una sesion iniciada."})
            }else{
                //renderizo
                res.render('resetPassword');
            }
    
        } catch (err) {
            res.send(`Error de vista de solicitud de restablecimiento de contraseña. Error: ${err}`)
        }
    }

    //Vista de 'restablecimiento de contraseña'
    //ruta ¨/password¨, metodo GET
    async renderNewPasswordForm(req, res){
        try {
            if(req.session.login){
                res.send({msg: "no puede estár logueado para resetear la contraseña."})
            }else{
                //renderizo
                res.render('newPasswordForm');
            }
    
        } catch (err) {
            res.send(`Error de vista de formulario de restablecimiento de contraseña. Error: ${err}`)
        }
    }
    

}

module.exports = viewsController;