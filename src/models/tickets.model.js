const mongoose = require("mongoose");

//collection
const ticketsCollection = 'tickets'

//user schema
const  ticketsSchema = new mongoose.Schema({
    code:{
        type:String,
        required:true
    },
    purchase_datetime:{
        type: Date,
        required:true
    },
    amount:{
        type: Number,
        required:true
    },
    purchaser:{
        type:String,
        required:true
    },
    products: [
        {
            product: {
                _id: {
                    type  : mongoose.Schema.Types.ObjectId,
                    require: true
                },
                title: {
                    type  : String,
                    require: true
                },
                price: {
                    type  : Number,
                    require: true
                },
                onSale: {
                    type  : Boolean,
                    require: true
                },
                descuento: {
                    type  : Number,
                    require: true
                },
                code: {
                    type  : String,
                    require: true
                },
            },
            quantity: {
                type: Number,
                require: true
            }
        }
    ]
})

/* 
    code: String debe autogenerarse y ser único
    purchase_datetime: Deberá guardar la fecha y hora exacta en la cual se formalizó la compra (básicamente es un created_at)
    amount: Number, total de la compra.
    purchaser: String, contendrá el correo del usuario asociado al carrito.

*/
const TicketsModel = mongoose.model(ticketsCollection, ticketsSchema)

module.exports = TicketsModel;