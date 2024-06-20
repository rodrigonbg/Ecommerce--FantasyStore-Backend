const passport = require ('passport');
const local = require ('passport-local');
const github = require ('passport-github2');
const DTOUser =  require('../dto/userProfile.dto.js')
const UserModel = require ('../models/user.models')
const { createHash, isValidPassword }= require ('../utils/hashBcrypt')
const CartsRepository = require("../repositories/cart.repository.js");
const cartsRepository = new CartsRepository();
const UserRepository = require('../repositories/user.repository.js');
const userRepository = new UserRepository();

const configObject = require('../config/dotenv.config.js');

const LocalStrategy  = local.Strategy;
const GithubStrategy  = github.Strategy;

//inicializador de middlewares de passport
const initializePassport = () => {
    
    //La estrategia despues de usarla me genera el req.user con la info
    passport.use('register', //nombre de la estrategia
        new LocalStrategy({
            passReqToCallback: true, //acceso al objeto req
            usernameField : 'email'
        },
        async (req, username, password, done) => { //funcion CB
            try {
                const {first_name, last_name, email, age, repeatPass} = req.body;
                
                if(password !== repeatPass){
                    req.flash('error', 'Las contraseñas no coinciden.')
                    return done(null, false, {status:401, message:'Las contraseñas no coinciden.'})
                } 
                
                const userDB = await UserModel.findOne({ email: email.toLowerCase()});
                if (userDB){
                    req.flash('error', 'Ya existe un usuario con ese email.');
                    return done(null, false, {status:401, message:'Ya existe un usuario con ese mail.'})
                } 
                
                //genermaos el user y lo mandamos con done
                const rol = (email === configObject.admin_email)? 'admin':'usuario';
                const newUser ={
                    first_name,
                    last_name,
                    email: email.toLowerCase(),
                    age: age,
                    password: createHash(password), 
                    rol : rol,
                    last_connection : new Date()
                }
                if (rol === 'usuario') {
                    newUser.cart = await cartsRepository.createCart().then(res=> res._id);
                }

                const result = await UserModel.create(newUser).then((res)=>{
                    req.logger.info('User creado con local passport')
                    return res
                });

                const {_id, cart, last_connection, documents} = result
                const user = new DTOUser(_id, first_name, last_name, rol, email, cart, last_connection, documents, age)

                return done(null, user);

            } catch (error) {
                return done(error)
            }
        })
    )

    passport.use('login',
        new LocalStrategy({
            passReqToCallback: true, //acceso al objeto req
            usernameField : 'email'
        },
        async (req ,email, password, done)=>{
            try {
                const userDB = await UserModel.findOne({ email: email.toLowerCase()});

                if(!userDB){
                    req.flash('error', {status:404, message:'Usuario no encontrado'});
                    return done(null, false, {status:404, message:'Usuario no encontrado'});
                } 
                if(!isValidPassword(password, userDB)){
                    req.flash('error', {status:401, message:'Contraseña incorrecta'});
                    return done(null, false, {status:401, message:'Contraseña incorrecta'});
                }

                await userRepository.updateLastConnection(userDB);

                const {_id, first_name, last_name, rol, cart, last_connection, documents, age} = userDB
                const user = new DTOUser(_id, first_name, last_name, rol, email, cart, last_connection, documents, age)

                return done(null, user)
            } catch (error) {
                return done(error)
            }
        })
    )

    passport.use('github', 
        new GithubStrategy({
            clientID: configObject.GithubClientID,
            clientSecret: configObject.GithubClientSecret,
            callbackURL: "http://localhost:8080/api/sessions/githubcallback",
            scope: ['user:email']  // Incluye este scope
        }, 
        async (accessToken, refreshToken, profile, done)=>{
            try {
                //en profile._json tengo los datos que quiero

                if (!profile.emails || profile.emails.length === 0) {//Para traer los mails
                    const response = await fetch('https://api.github.com/user/emails', {
                        headers: {
                            'Authorization': `token ${accessToken}`,
                            'User-Agent': 'Fantasy Store'
                        }
                    });
              
                    if (response.ok) {
                        const emails = await response.json();
              
                        if (emails && emails.length > 0) {
                            const primaryEmail = emails.find(email => email.primary).email;
                            profile.emails = [{ value: primaryEmail }];
                            profile._json.email = primaryEmail;  // Guardar el email en profile._json.email
                        }

                    }else {
                        throw new Error('Failed to fetch emails');
                    }

                }else{//Si el email ya está en el perfil, asignarlo a profile._json.email
                    profile._json.email = profile.emails[0].value;
                }

                const user = await UserModel.findOne({email : profile._json.email })

                //una vez buscado el user, si no existe, lo creamos. de lo contrario lo retornamos
                if (!user){

                    const rol = (email === configObject.admin_email)? 'admin':'usuario';
                    const newUser = {
                        first_name : profile._json.name,
                        last_name : "",
                        age : 10,
                        email : profile._json.email,
                        password : '',
                        rol: rol,
                        last_connection : new Date()
                    }
                    if (rol === 'usuario') {
                        newUser.cart = await cartsRepository.createCart().then(res=> res._id);
                    }

                    const result = await UserModel.create(newUser).then(()=>{
                        req.logger.info('User creado con github passport')
                    });

                    return done(null, result)
                }else{
                    await userRepository.updateLastConnection(user);
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
        const dtoUser = new DTOUser(user._id, user.first_name, user.last_name, user.rol, user.email, user.cart, user.last_connection, user.documents, user.age);
        done(null, dtoUser);
    })

}

module.exports = initializePassport;