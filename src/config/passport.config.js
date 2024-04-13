const passport = require ('passport');
const local = require ('passport-local');
const github = require ('passport-github2');
const DTOUser =  require('../dto/userProfile.dto.js')

const UserModel = require ('../models/user.models')
const { createHash, isValidPassword }= require ('../utils/hashBcrypt')

const CartsRepository = require("../repositories/cart.repository.js");
const cartsRepository = new CartsRepository();

const configObject = require('../config/dotenv.config.js')
//estrategia local
const LocalStrategy  = local.Strategy;

//estrategia github
const GithubStrategy  = github.Strategy;

/* 
App ID: 851023
Client ID: Iv1.11d64c1fa3cb63e0 
Client secret : c99836d1197c68c06ca2f050ef69ea72c0501529
*/

//inicializador de middlewares de passport
const initializePassport = () => {
    
    //La estrategia despues de usarla me genera el req.user con la info
    passport.use('register', //nombre de la estrategia
        new LocalStrategy({
            passReqToCallback: true, //acceso al objeto req
            usernameField : 'email'
        },
        async (req, username, password, done) => { //funcion CB
            const {first_name, last_name, email, age} = req.body;

            try {
                const user = await UserModel.findOne({ email: email.toLowerCase()});
                
                if (user) return done(null, false); //user no disponible
                
                
                //genermaos el user y lo mandamos con done
                const rol = (email === configObject.admin_email)? 'admin':'usuario';
                const newUser ={
                    first_name,
                    last_name,
                    email,
                    age,
                    password: createHash(password), 
                    rol : rol
                }
                //creo y agrego un carrito solo si no se es admin 
                if (rol === 'usuario') {
                    newUser.cart = await cartsRepository.createCart().then(res=> res._id);
                }

                const  result = await UserModel.create(newUser);

                return done(null, result);

            } catch (error) {
                return done(error)
            }
        })
    )

    passport.use('login',
        new LocalStrategy({
            usernameField : 'email'
        },
        async (email, password, done)=>{
            try {
                const user = await UserModel.findOne({ email: email.toLowerCase()});

                if(!user) return done(null, false) //No existe el usuario

                if(!isValidPassword(password, user)) return done (null,false)//la contrasena es incorrecta

                return done(null, user)
            } catch (error) {
                return done(error)
            }
        })
    )

    passport.use('github', 
        new GithubStrategy({
            clientID: 'Iv1.11d64c1fa3cb63e0',
            clientSecret: 'c99836d1197c68c06ca2f050ef69ea72c0501529',
            callbackURL: "http://localhost:8080/api/sessions/githubcallback"
        }, 
        async (accessToken, refreshToken, profile, done)=>{
            //en profile._json tengo los datos que quiero
            const user = await UserModel.findOne({email : profile._json.email })
            console.log(profile._json)
            try {
                //una vez buscado el user, si no existe, lo creamos. de lo contrario lo retornamos
                if (!user){

                    const rol = (email === configObject.admin_email)? 'admin':'usuario';
                    const newUser = {
                        first_name : profile._json.name,
                        last_name : "",
                        age : 10,
                        email : profile._json.email,
                        password : '',
                        cart: idCart,
                        rol: rol
                    }
                    //creo y agrego un carrito solo si no se es admin 
                    if (rol === 'usuario') {
                        newUser.cart = await cartsRepository.createCart().then(res=> res._id);
                    }

                    const result = await UserModel.create(newUser);
                    return done(null, result)
                }else{
                    return done(null, user);
                }
            } catch (error) {
                return done (error)
            }
            
        })
    )

    passport.serializeUser((user, done) =>{
        done(null, user._id);
    })

    passport.deserializeUser( async (id ,done) =>{
        const user = await UserModel.findById({_id : id});
        const dtoUser = new DTOUser(user._id, user.first_name, user.last_name, user.rol, user.email, user.cart);
        done(null, dtoUser);
    })

}

module.exports = initializePassport;