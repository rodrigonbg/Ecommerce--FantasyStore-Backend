const { Int32 } = require("mongodb");
const mongoose = require("mongoose");

//colleccion
const productsCollection = "products";

//Esquema del modelo de productos
const  productSchema = new mongoose.Schema({
    title: String,
    descripcion: String,
    categoria: String,
    idCategoria: Number,
    thumbnail: Array,
    price: Number,
    onSale: Boolean,
    descuento: Number,
    stock: Number,
    alt: String,
    status: Boolean,
    code: String
});

//Definimos el modelo
const  ProductsModel= mongoose.model(productsCollection ,productSchema);

module.exports = ProductsModel;