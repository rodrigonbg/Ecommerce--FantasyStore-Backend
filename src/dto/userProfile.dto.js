class userProfileDTO{
    constructor(ID, firstName, lastName, rol, correo, cart, last_connection = null, documents = []){
        this._id = ID,
        this.firstName = firstName;
        this.lastName = lastName;
        this.rol = rol;
        this.correo = correo;
        if(cart){
            this.cart = cart.toString()
        }
        this.last_connection = last_connection;
        this.documents = documents;
    }
}


module.exports = userProfileDTO;