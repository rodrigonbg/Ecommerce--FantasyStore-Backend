const express = require("express");
const server = express();
const PUERTO = 8080;

//Middelwares
server.use(express.json());
server.use(express.urlencoded({extended: true}));

//Routing 
const productsRouter = require("./routes/products.router.js");
const cartsRouter = require("./routes/carts.router.js");

server.use("/api/products", productsRouter);
server.use("/api/carts", cartsRouter);

//Listen
server.listen(PUERTO, ()=>{
    console.log(`Escuchando el puerto http//localhost:${PUERTO}`)
})