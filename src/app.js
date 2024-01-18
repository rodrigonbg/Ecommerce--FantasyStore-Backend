const express = require("express");
const server = express();
const socket = require("socket.io");
const PUERTO = 8080;

//Middelwares
server.use(express.json());
server.use(express.urlencoded({extended: true}));
server.use(express.static("./src/public"))

//Express-handlebars
const exphbs = require("express-handlebars");
server.engine("handlebars", exphbs.engine()); //-> le digo a express que cuando encuentre un archivo con la extensión 'handlebars', use el motor de plantillas handlebars.
server.set("view engine", "handlebars");
server.set("views", "./src/views"); //-> le digo a express dopnde tiene que ir a buscar los archivos "handlebars"

//Routing 
const productsRouter = require("./routes/products.router.js");
const cartsRouter = require("./routes/carts.router.js");
const viewsRouter = require("./routes/views.router.js");

server.use("/api/products", productsRouter);
server.use("/api/carts", cartsRouter);
server.use("/", viewsRouter);



//Listen
server.listen(PUERTO, ()=>{
    console.log(`Escuchando el puerto http//localhost:${PUERTO}`)
})