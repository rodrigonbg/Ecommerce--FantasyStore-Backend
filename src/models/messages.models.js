const mongoose = require("mongoose");

//colleccion
const messagesCollection = 'messages';

//Esquema del modelo de carritos
const  messageSchema = new mongoose.Schema({
    user: { type: String, require: true}, 
    message: { type: String, require: true},
});

//Definimos el modelo
const  messagesModel= mongoose.model(messagesCollection ,messageSchema);

module.exports = messagesModel;