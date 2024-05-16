const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2")


//colleccion
const productsCollection = "products";

//Esquema del modelo de productos
const  productSchema = new mongoose.Schema({
    title:{ type: String, require: true}, 
    descripcion: { type: String, require: true},
    categoria: { type: String, require: true},
    idCategoria: { type: Number, require: true},
    thumbnail: { type:[String], require: false},
    price: { type: Number, require: true},
    onSale: { type: Boolean, require: true},
    descuento: { type: Number, require: true}, //si esta en venta se puede poner un descuento
    stock: { type: Number, require: true},
    alt: { type: String, require: false},
    status: { type: Boolean, require: true},
    code: { type: String, require: true, unique: true},
    owner: { type: String, require: true, default:'admin'}
});

//Plugin de paginate
productSchema.plugin(mongoosePaginate)

//Definimos el modelo
const  ProductsModel= mongoose.model(productsCollection ,productSchema);

module.exports = ProductsModel;