const { Int32 } = require("mongodb");
const mongoose = require("mongoose");

//colleccion
const messagesCollection = 'messages';

//Esquema del modelo de carritos
const  messageSchema = new mongoose.Schema({
    id: Number,
    message: String
});

//Definimos el modelo
const  messagesModel= mongoose.model(messagesCollection ,messagesSchema);

module.exports = messagesModel;