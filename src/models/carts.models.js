const { Int32 } = require("mongodb");
const mongoose = require("mongoose");

//colleccion
const cartsCollection = 'carts';

//Esquema del modelo de carritos
const  cartsSchema = new mongoose.Schema({
    id: Number,
    products: Array
});

//Definimos el modelo
const  cartsModel= mongoose.model(cartsCollection ,cartsSchema);

module.exports = cartsModel;