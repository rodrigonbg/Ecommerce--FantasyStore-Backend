const mongoose = require("mongoose");
const cartsModel = require("./carts.models");

//collection
const usersCollection = 'users'

//user schema
const  userSchema = new mongoose.Schema({
    first_name:{
        type:String,
        required:true
    },
    last_name:{
        type:String,
    },
    email:{
        type:String,
        index:true, //indexing the field for faster search
        unique:true
    },
    age:{
        type:Number,
    },
    password:{
        type:String,
    },
    cart:{
        type:mongoose.Schema.Types.ObjectId
    },
    rol:{
        type:String,
        required:true
    }

})

const UserModel = mongoose.model(usersCollection, userSchema)

module.exports = UserModel;