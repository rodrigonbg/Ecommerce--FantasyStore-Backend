const mongoose = require("mongoose");

const cartsCollection = 'carts';

//Esquema del modelo de carritos
const  cartsSchema = new mongoose.Schema({
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'products'
            },
            quantity: {
                type: Number,
                require: true
            }
        }
    ]
});

//middleware PRE
cartsSchema.pre(/^find/, function(next){ //para que funcione con todos los tipos de find en Mongoose (por ejemplo, findOne, findMany, etc.),
    this.populate('products.product')
    next()
})

const  cartsModel= mongoose.model(cartsCollection ,cartsSchema);

module.exports = cartsModel;