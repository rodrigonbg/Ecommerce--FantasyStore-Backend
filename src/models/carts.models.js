const mongoose = require("mongoose");

//colleccion
const cartsCollection = 'carts';

//Esquema del modelo de carritos
const  cartsSchema = new mongoose.Schema({
    products: Array
});

//Definimos el modelo
const  cartsModel= mongoose.model(cartsCollection ,cartsSchema);

module.exports = cartsModel;