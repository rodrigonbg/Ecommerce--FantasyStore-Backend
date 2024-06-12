const userProfileDTO = require("../dto/userProfile.dto.js");
const userModel = require("../models/user.models.js");
const { createHash } = require("../utils/hashBcrypt.js");

class UserRepository{
    
    async getUsers() {
        try {
            const users = await userModel.find(); 
            if(!users){
                return `No hay usuarios disponibles.`
            }else{

                const response = [];
                users.forEach((user)=>{
                    let userDto = new userProfileDTO(user._id, user.first_name, user.last_name, user.rol, user.correo, user.cart, user.last_connection, user.documents)
                    response.push(userDto)
                })

                return response
            }
        } catch (error) {
            throw `Ocurrio un error al obtener el usuario. ${error}`
        }
    }

    async getUserbyCartId(id) {
        try {
            const user = await userModel.findOne({ cart: id }); 

            if(!user){
                return `No existe un usuario con el carrito asociado.`
            }else{
                return user
            }
        } catch (error) {
            throw `Ocurrio un error al obtener el usuario. ${error}`
        }
    }

    async getUserbyEmail(email) {
        try {
            const user = await userModel.findOne({ email: email.toLowerCase() }); 

            if(!user){
                throw `No existe un usuario con ese email.`
            }else{
                return user
            }
        } catch (error) {
            throw `Ocurrio un error al obtener el usuario. ${error}`
        }
    }

    async getUserbyId(id) {
        try {
            const user = await userModel.findById(id); 

            if(!user){
                throw `No existe un usuario con ese id.`
            }else{
                return user
            }
        } catch (error) {
            throw `Ocurrio un error al obtener el usuario. ${error}`
        }
    }

    //Funicon para guardar un token en un usuario por 1 hora
    async saveTokenInUser(user, token){
        try {
            user.resetToken = {
                token: token,
                expiresAt: new Date( Date.now() + 3600000)//en 1hora
            }
            await user.save()
        } catch (error) {
            throw `Ocurrio un error al guardar el token. ${error}`
        }
    }

    //Funcion para cambiar el rol de un usuario
    async changeUserRol(user, newRol){
        try {
            user.rol = newRol.toLowerCase();
            await user.save();
        } catch (error) {
            throw `Ocurrio un error al cambiar el rol. ${error}`
        }
    }
    
    //Funcion para cambiar la contraseña de un usuario con su email
    async changeUserPass(user, newPass){
        try {
            user.password = createHash(newPass);
            await user.save();
        } catch (error) {
            throw `Ocurrio un error al cambiar la contraseña. ${error}`
        }
    }
    
    async updateLastConnection(user){
        try {
            user.last_connection =  new Date();
            await user.save();
        } catch (error) {
            throw `Ocurrio un error al actualizar la ultima conexión en la base de datos ${error}`
        }
    }
    
    async addDocuments(user, document=null, homeBill=null, bankBill=null){
        try {
            const Document = { name: 'document', reference: document}
            const HomeBill = { name: 'homeBill', reference: homeBill}
            const BankBill = { name: 'bankBill', reference: bankBill}
            user.documents =[Document, HomeBill, BankBill];
            await user.save();
        } catch (error) {
            throw `Ocurrio un error al cargar los documentos del usuario ${error}`
        }
    }

    async deleteUser(id){
        try {
            const deleted = await userModel.findByIdAndDelete(id);
            return deleted;
        } catch (error) {
            throw `Ocurrio un error al eliminar el usuario ${error}`
        }
    }
}

module.exports = UserRepository;