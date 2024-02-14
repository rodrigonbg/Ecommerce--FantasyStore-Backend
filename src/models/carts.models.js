const mongoose = require("mongoose");

//colleccion
const cartsCollection = 'carts';

//Esquema del modelo de carritos
const  cartsSchema = new mongoose.Schema({
    //_id, creado automaticamente
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
/* Cuando intentas utilizar populate en un hook de Mongoose, como en un pre middleware, 
debes tener en cuenta que debes usar una función estándar y no una función de flecha (=>). 
Esto es porque las funciones de flecha no vinculan su propio this y, por lo tanto, no tendrán acceso a 
las funciones de Mongoose. */
cartsSchema.pre(/^find/, function(next){
    this.populate('products.product')
    next()
})

/* 
Si deseas que el middleware funcione para todos los tipos de find en Mongoose (por ejemplo, findOne, findMany, etc.), 
puedes hacerlo con el uso de una expresión regular /^find/ en lugar de simplemente 'find'. significa que el middleware se aplicará a 
cualquier método find, independientemente de los caracteres que le sigan. */

//Definimos el modelo
const  cartsModel= mongoose.model(cartsCollection ,cartsSchema);

module.exports = cartsModel;