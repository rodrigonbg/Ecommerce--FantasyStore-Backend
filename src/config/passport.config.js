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
                
                if(password !== repeatPass) throw 'las contraseñas no coinciden'

                const user = await UserModel.findOne({ email: email.toLowerCase()});
                if (user) return done(null, false); //user no disponible
                
                //genermaos el user y lo mandamos con done
                const rol = (email === configObject.admin_email)? 'admin':'usuario';
                const newUser ={
                    first_name,
                    last_name,
                    email: email.toLowerCase(),
                    age,
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

                if(!user) return done('Usuario no encontrado.');
                if(!isValidPassword(password, user)) return done ('Contraseña incorrecta.');

                await userRepository.updateLastConnection(user);
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
                        console.log('Emails:', emails);  // Log de los emails obtenidos
              
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
        const dtoUser = new DTOUser(user._id, user.first_name, user.last_name, user.rol, user.email, user.cart);
        done(null, dtoUser);
    })

}

module.exports = initializePassport;