const dotenv = require('dotenv');
const program = require('../utils/commander.js')

//Con program.opts() obtengo las opciones que se pasan por la línea de comandos
const {mode, p} =  program.opts();


dotenv.config({
    path: mode === 'production'? './.env.production' : (mode === 'development'? './.env.development' : './.env.testing')
})

const configObject = {
    mode : mode,
    mongo_url : process.env.MONGO_URL,
    port : p? p : process.env.PORT,
    //Si especifico el puerto por consola, uso ese, de lo contratrio uso el de .env
    admin_email : process.env.ADMIN_EMAIL,
    admin_pass : process.env.ADMIN_PASSWORD
}

//Url de bd de Testing solo en modo de desarrollador.
//mode === 'development' ? configObject.mongo_url_testing = process.env.MONGO_URL_TESTING : null

console.log ('Objeto de configuracion gral:', configObject)

module.exports = configObject;