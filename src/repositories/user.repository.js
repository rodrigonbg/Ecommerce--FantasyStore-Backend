const userModel = require("../models/user.models.js");

class UserRepository{
    
    async getUserbyCartId(id) {
        try {
            const user = await userModel.findOne({ cart: id }); 

            if(!user){
                return `No existe un usuario con el carrito asociado.`
            }else{
                return user
            }
        } catch (error) {
            return `Ocurrio un error al obtener el usuario. ${error}`
        }
    }

    
}

module.exports = UserRepository;