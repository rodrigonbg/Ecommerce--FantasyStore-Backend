class userProfileDTO{
    constructor(ID, firstName, lastName, rol, correo, cart){
        this._id = ID,
        this.firstName = firstName;
        this.lastName = lastName;
        this.rol = rol;
        this.correo = correo;
        if(cart){
            this.cart = cart.toString()
        }
    }
}

module.exports = userProfileDTO;