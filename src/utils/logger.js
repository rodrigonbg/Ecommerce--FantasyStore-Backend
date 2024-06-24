const winston = require("winston");
const configObject = require('../config/dotenv.config.js')

//Niveles
const niveles = {
    nivel: {
        fatal: 0,
        error: 1,
        warning: 2,
        info: 3,
        http: 4,
        debug: 5
    },
    
    //Colores para formatear la salida 
    colores: {
        fatal: "red",
        error: "yellow",
        warning: "blue",
        info: "green",
        http: "magenta",
        debug: "white"
    }
}

//Loguer de desarrollo
const loggerDEV = winston.createLogger({
    levels: niveles.nivel,

    transports: [
        new winston.transports.Console({
            level: 'debug', 
            
            format: winston.format.combine(
                winston.format.colorize({colors: niveles.colores}), 
                winston.format.simple()
            )
        })
    ]
})

//Loguer de produccion
const loggerPROD = winston.createLogger({
    levels: niveles.nivel,

    transports: [
        new winston.transports.Console({
            level: 'info', 
            
            format: winston.format.combine(
                winston.format.colorize({colors: niveles.colores}), 
                winston.format.simple()
            )
        }),
        new winston.transports.File({
            filename: "./errors.log", 
            level:'error',
            format: winston.format.simple()
        })
    ]
})


//Creamos un middleware: 
const addLogger = (req, res, next) => {
    req.logger = configObject.mode === 'production'? loggerPROD : loggerDEV; 

    //Configuramos el mensaje para las peticiones https
    req.logger.http(`${req.method} en ${req.url} - ${new Date().toLocaleDateString()}`);

    next();
}

module.exports = addLogger;