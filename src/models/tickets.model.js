const mongoose = require("mongoose");

const ticketsCollection = 'tickets'

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
                thumbnail: { 
                    type:[String], 
                    require: false
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

const TicketsModel = mongoose.model(ticketsCollection, ticketsSchema)

module.exports = TicketsModel;