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
    port : p? p : process.env.PORT, //Si especifico el puerto por consola, uso ese, de lo contratrio uso el del .env
    admin_email : process.env.ADMIN_EMAIL,
    GithubAppID: process.env.GithubAppID,
    GithubClientID: process.env.GithubClientID,
    GithubClientSecret : process.env.GithubClientSecret
}

console.log ('Objeto de configuracion gral:', configObject)

module.exports = configObject;