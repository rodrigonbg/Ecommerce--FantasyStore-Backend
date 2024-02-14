const express = require("express");
const router = express.Router();

//product manager
const ProductManager = require("../dao/db/product-manager-db")
const productManager = new ProductManager()

//cart manager
const CartManager = require("../dao/db/cart-manager-db")
const cartManager = new CartManager()


//ROUTING

/* ----------------------------------------GETs----------------------------------------------- */
//Vista de los productos
router.get("/", async (req, res)=>{
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
        const products = await productManager.getProducts({queryObject, limit, page, order})
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
        const carts = await cartManager.getCarts()
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
            cartsId: cartsId
        }
        
        //le paso la respuesta al index y lo renderizo
        res.render('index',{products: resp});
        
    } catch (err) {
        res.status(500).json({
            error: `Error al obtener los productos. Error: ${err}`
        })
    }
})

 //Vista de los carritos
router.get("/carts", async (req, res)=>{
    try {
        //Traigo los carritos
        const carts = await cartManager.getCarts();

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
})

//Viste de un carrto
router.get("/carts/:cid", async (req, res)=>{
    try {
        //Traigo los carritos
        let cid= req.params.cid;
        const cart = await cartManager.getCartbyId(cid);

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
})

//Vista de productos en tiempo real
router.get("/realtimeproducts", async (req, res)=>{
    try {
        //renderizo realTimeProducts
        res.render('realTimeProducts');

    } catch (err) {
        res.status(500).json({
            error: `Error al obtener los productos en tiempo real. Error: ${err}`
        })
    }
})

//Vista del chat 
router.get("/chat", async (req, res)=>{
    try {
        //renderizo la vista del chat
        res.render('chat');

    } catch (err) {
        res.status(500).json({
            error: `Error al obtener los chats. Error: ${err}`
        })
    }
})

module.exports = router;