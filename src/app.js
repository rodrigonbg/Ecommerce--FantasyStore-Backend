const express = require("express");
const http = require("http");
const socket = require("socket.io");
const db = require("../src/database.js")
const productsModel = require("./models/products.models.js");

const cookieParser =  require('cookie-parser');
const MongoStore = require("connect-mongo")
const session = require('express-session')

const PUERTO = 8080;
const app = express();
const server = http.createServer(app);

//instancia socket del servidor
const io = socket(server);

//Multer
const multer = require("multer");
const storage  = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, ".src/public/img") //carpeta donde se guardaran las imagenes 
    },
    filename:(req,file,cb)=>{
        cb(null, file.originalname) //nombre con el que se guardara en el disco
    }
});
app.use(multer({storage}).single("image"));

//Middelwares para express
app.use(express.json()); 
app.use(express.urlencoded({extended: true}));
app.use(express.static("./src/public"))
app.use(cookieParser())
app.use(session({
    secret: 'secretPass',
    resaved: true,
    saveUnitialized:true,
    store: MongoStore.create({
        mongoUrl: "mongodb+srv://rodrigonbg:AtlasPass361713@cluster0.cik8wio.mongodb.net/E-Commerce-Fantasy-Store?retryWrites=true&w=majority",
        ttl: 600 //10 minutos
    })
}))

//Express-handlebars
const exphbs = require("express-handlebars");
app.engine("handlebars", exphbs.engine()); //-> le digo a express que cuando encuentre un archivo con la extensión 'handlebars', use el motor de plantillas handlebars.
app.set("view engine", "handlebars");
app.set("views", "./src/views"); //-> le digo a express dopnde tiene que ir a buscar los archivos "handlebars"

//Routing 
const productsRouter = require("./routes/products.router.js");
const cartsRouter = require("./routes/carts.router.js");
const viewsRouter = require("./routes/views.router.js");
const usersRouter = require("./routes/users.router.js");
const sessionsRouter = require("./routes/sessions.router.js");

app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/users", usersRouter);
app.use("/api/session", sessionsRouter);
app.use("/", viewsRouter);

//escucho el evento 'connection'
io.on("connection", async(socket) => {
    console.log(`cliente conectado!!`);

    //envio los productos al cliente conectado
    socket.emit("productos", await productsModel.find());

    //escucho el evento 'eliminarProducto' que envía el cliente
    socket.on("eliminarProducto", async (id)=>{
        await productsModel.findByIdAndDelete(id);

        //una vez eliminado el producto, volvemos a enviar el array de productos
        io.sockets.emit("productos", await productsModel.find());
    })

    //escucho el evento 'agregarProducto' que envia el cliente
    socket.on('agregarProducto', async(producto) =>{
        const newProd = new productsModel(producto)
        await newProd.save();

        //una vez agregado el producto, volvemos a enviar el array de productos
        io.sockets.emit("productos", await productsModel.find());
    })
})

//Listen
server.listen(PUERTO, ()=>{
    console.log(`Escuchando el puerto http://localhost:${PUERTO}`)
})