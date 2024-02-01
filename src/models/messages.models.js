const mongoose = require("mongoose");

//colleccion
const messagesCollection = 'messages';

//Esquema del modelo de carritos
const  messageSchema = new mongoose.Schema({
    user:String, 
    message: String});

//Definimos el modelo
const  messagesModel= mongoose.model(messagesCollection ,messageSchema);

module.exports = messagesModel;