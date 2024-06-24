const ProductRepository = require("../repositories/product.repository.js");
const productRepository = new ProductRepository();

const CartsRepository = require("../repositories/cart.repository.js");
const cartsRepository = new CartsRepository();

const UserRepository = require("../repositories/user.repository.js");
const userRepository = new UserRepository();

const UserProfileDTO = require("../dto/userProfile.dto.js");

class viewsController{

    //ruta ¨/¨, metodo GET
    async renderProducts(req, res){
        console.log('renderProds ',req.user)
        console.log('renderProds',req.session)
        try {
            //Guardamos los query (recordar que el query se levantan con ?limit=5&page=2...)
            let { limit, page, priceOrder, ...queryObject} = req.query
    

            limit = parseInt(Number(req.query.limit)? req.query.limit : 10);
            page = parseInt(Number(req.query.page)? req.query.page : 1);
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

            return res.render('index',{info: resp});
            
        } catch (err) {
            return res.status(500).json({error: `Error al obtener los productos. Error: ${err}`})
        }
    }

    //Vista del usuario conectado
    //ruta ¨/user¨, metodo GET
    async renderConectedUser(req, res){
        try {
            if(req.user){
                const profile = new UserProfileDTO(req.user._id ,req.user.firstName, req.user.lastName, req.user.rol, req.user.correo, req.user.cart);
                return res.render( "profile", { user : profile} )
            }
            res.send('No hay usuario logueado')
        } catch (err) {
            return res.status(500).json({error: `Error de vista usuario. Error: ${err}`})
        }
    }

    //Vista de un usuario por admin
    //ruta ¨/user/:uid¨, metodo GET
    async renderUserById(req, res){
        try {
            const {uid} = req.params;
            
            if(!uid){
                return res.status(400).send({status:400, message:'Parametros incorrectos'})
            }

            const user = await userRepository.getUserbyId(uid);
            if(!user){
                return res.status(404).send({status:404, message:'No se encontraron usuarios con esas credenciales.'})
            }
            const {_id, first_name, last_name, rol, email, cart, last_connection, documents} = user
            const userDTO = new userProfileDTO(_id.toString(), first_name, last_name, rol, email, cart, last_connection, documents)

            if(documents.length > 0){
                userDTO.hasDocuments = true;
                userDTO.document = documents[0].reference;
                userDTO.homeBill = documents[1].reference;
                userDTO.bankBill = documents[2].reference;
            }else{
                userDTO.hasDocuments = false;
            }

            userDTO.premium = (rol==='premium')? true : false;

            return res.render( "userById", { user : userDTO} )

        } catch (err) {
            return res.status(500).json({error: `Error al renderizar la vista de un usuario: ${err}`})
        }
    }
    
    //Vista de los carritos
    //ruta ¨/carts¨, metodo GET
    async renderCarts(req, res){
        try {
            const carts = await cartsRepository.getCarts();
    
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
            res.status(500).json({error: `Error al obtener los carritoss. Error: ${err}`})
        }
    }
    
    //Viste de un carrto
    //ruta ¨/carts/:cid¨, metodo GET
    async renderCart(req, res){
        try {
            let cid= req.params.cid;
            const cart = await cartsRepository.getCartbyId(cid);

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
            res.status(500).json({error: `Error al obtener los carritoss. Error: ${err}`})
        }
    }
    
    //Vista de productos en tiempo real
    //ruta ¨/admin¨, metodo GET
    async renderRealTimeProducts(req, res){
        try {
            const rol = req.user.rol;
            return res.render('admin',{rol});
        } catch (err) {
            return res.status(500).json({error: `Error al obtener los productos en tiempo real. Error: ${err}`})
        }
    }

    async renderPremiumProducts(req, res){
        try {
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

            return res.render('premiumProducts',{payload});
    
        } catch (err) {
            return res.status(500).json({error: `Error al obtener los productos de usuario premium. Error: ${err}`})
        }
    }
    
    //Vista de login
    //ruta ¨/loginForm¨, metodo GET
    async renderLoginForm(req, res){
        try {
            if(req.session.login){
                return res.send({msg: "Ya hay un usuario registrado"})
            }
            return res.render('loginForm');
        } catch (err) {
            return res.status(500).json({error: `Error de vista login. Error: ${err}`})
        }
    }
    
    //Vista de singin
    //ruta ¨/singinForm¨, metodo GET
    async renderSinginForm(req, res){
        try {
            if(req.session.login){
                return res.send({msg: "Primero debes cerrar la sesión actual para registrarte."})
            }

            return res.render('singinForm');
            
        } catch (err) {
            return res.status(500).json({error: `Error de vista singIn. Error: ${err}`})
        }
    }
    
    //Vista de 'enviar correo de restablecimiento'
    //ruta ¨/reset-password¨, metodo GET
    async renderResetPassword(req, res){
        try {
            if(req.session.login){
                return res.send({msg: "Usted ya tiene una sesion iniciada."})
            }
            return res.render('resetPassword');
    
        } catch (err) {
            return res.status(500).json({error: `Error de vista de solicitud de restablecimiento de contraseña. Error: ${err}`})
        }
    }

    //Vista de 'restablecimiento de contraseña'
    //ruta ¨/password¨, metodo GET
    async renderNewPasswordForm(req, res){
        try {
            if(req.session.login){
                return res.send({msg: "no puede estár logueado para resetear la contraseña."})
            }
            return res.render('newPasswordForm');
    
        } catch (err) {
            return res.status(500).json({error: `Error de vista de formulario de restablecimiento de contraseña. Error: ${err}`})
        }
    }
    
    //Vista de formulario de documentos
    //ruta ¨/password¨, metodo GET
    async renderAddDocumentsForm(req, res){
        try {
            const correo = req.user.correo;
            const user = await userRepository.getUserbyEmail(correo);
            const {_id, first_name, last_name, rol, email, cart, last_connection, documents} = user
            const userDTO = new UserProfileDTO(_id.toString(), first_name, last_name, rol, email, cart, last_connection, documents)

            if(documents.length > 0){
                userDTO.hasDocuments = true;
                userDTO.document = documents[0].reference;
                userDTO.homeBill = documents[1].reference;
                userDTO.bankBill = documents[2].reference;
            }else{
                userDTO.hasDocuments = false;
            }

            if(!user){
                res.status(404).send({status:404, message:'No se logró encontrar el usuario logueado en la base de datos.'})
            }
            return res.render('addDocumentsForm', {user:userDTO});
        } catch (err) {
            return res.status(500).json({error: `Error de vista de formulario de de carga de documentos. Error: ${err}`})
        }
    }
}

module.exports = viewsController;