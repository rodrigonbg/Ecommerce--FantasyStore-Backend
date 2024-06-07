const mongoose = require("mongoose");

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
        enum: ['admin', 'usuario', 'premium'],
        required:true,
        default : 'usuario'
    },
    resetToken:{
        token: String,
        exipresAt: Date
    },
    documents:[
        {
            name:{
                type:String,
            },
            reference: {
                type:String,
                default: ""
            }
        }
    ],
    last_connection:{
        type: Date,
        required:true
    }
})

const UserModel = mongoose.model(usersCollection, userSchema)

module.exports = UserModel;