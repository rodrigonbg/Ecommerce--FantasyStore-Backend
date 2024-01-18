const express = require("express");
const http = require("http");
const socket = require("socket.io");

const PUERTO = 8080;
const app = express();
const server = http.createServer(app);
//instancia socket del servidor
const io = socket(server);

//Middelwares
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static("./src/public"))

//Express-handlebars
const exphbs = require("express-handlebars");
app.engine("handlebars", exphbs.engine()); //-> le digo a express que cuando encuentre un archivo con la extensión 'handlebars', use el motor de plantillas handlebars.
app.set("view engine", "handlebars");
app.set("views", "./src/views"); //-> le digo a express dopnde tiene que ir a buscar los archivos "handlebars"

//Routing 
const productsRouter = require("./routes/products.router.js");
const cartsRouter = require("./routes/carts.router.js");
const viewsRouter = require("./routes/views.router.js");

app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/", viewsRouter);




//OBTENGO EL ARRAY DE PRODUCTOS
const ProductManager = require("./controller/product-manager.js");
const productManager = new ProductManager("./src/models/productos.json");


//escucho el evento 'connection'
io.on("connection", async(socket) => {
    console.log(`cliente conectado!!`);

    //envio los productos al cliente conectado
    socket.emit("productos", await productManager.readProducts());

    //escucho el evento 'eliminarProducto' que envía el cliente
    socket.on("eliminarProducto", async (id)=>{
        await productManager.deleteProduct(id);

        //una vez eliminado el producto, volvemos a enviar el array de productos
        io.sockets.emit("productos", await productManager.readProducts());
    })

    //escucho el evento 'agregarProducto' que envia el cliente
    socket.on('agregarProducto', async(producto) =>{
        await productManager.addProduct(producto)

        //una vez agregado el producto, volvemos a enviar el array de productos
        io.sockets.emit("productos", await productManager.readProducts());
    })
})






//Listen
server.listen(PUERTO, ()=>{
    console.log(`Escuchando el puerto http//localhost:${PUERTO}`)
})