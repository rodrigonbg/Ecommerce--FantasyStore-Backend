const mongoose = require("mongoose");
const configObject = require('./config/dotenv.config.js')
const mongo_url = configObject.mongo_url;
const mode = configObject.mode;

//SINGLETONE
class BaseDatos {
    static #instancia; //Las variables estaticas pertenecen a la clase, son privadas
    //Se declara una variable estática y privada #instancia. La palabra clave static significa que esta 
    //variable pertenece a la clase en sí, no a las instancias individuales de la misma. 
    
    //cada vez que genero una instancia de la clase se ejecuta el constructor y se conecta 
    constructor(){
        mongoose.connect(mongo_url)
            .then(()=> console.log(`Conectado a la base de datos - ${mode}.`))
            .catch(err => console.log(err))
    }

    static getInstancia() {
        //Si existe una instancia, la retonramos
        if(this.#instancia) {
            console.log("Conexion previa!!");
            return this.#instancia;
        }

        //Si no exite una instancia, la creamos y retornamos
        this.#instancia = new BaseDatos();
        console.log("Nueva conexión!!");
        return this.#instancia;
    }
}

module.exports = BaseDatos.getInstancia();