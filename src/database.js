const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://rodrigonbg:AtlasPass361713@cluster0.cik8wio.mongodb.net/E-Commerce-Fantasy-Store?retryWrites=true&w=majority")
    .then(()=> console.log('Conectado a la base de datos.'))
    .catch(err => console.log(err))

module.exports = mongoose;