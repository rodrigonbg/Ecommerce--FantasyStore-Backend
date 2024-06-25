const express = require("express");
const http = require("http");
const https = require("https");
const socket = require("socket.io");
const db = require("../src/database.js")
const productsModel = require("./models/products.models.js");
const cors = require("cors");
const flash = require('connect-flash');
const cookieParser =  require('cookie-parser');
const MongoStore = require("connect-mongo")
const session = require('express-session')
const configObject = require('./config/dotenv.config.js')
const PUERTO = configObject.port||8080;
const mongo_url = configObject.mongo_url;

const app = express();
const server = http.createServer(app);

//Logger
const addLogger = require("./utils/logger.js");
app.use(addLogger);

//instancia socket del servidor
const io = socket(server);

//Middelwares para express
app.use(cors({
    origin: (origin, callback) => {
        callback(null, true); // Permite cualquier origen
    },
    credentials:true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static("./src/public"))
app.use(cookieParser())
app.use(session({
    name: 'connect.sid',
    secret: 'secretPass',
    resaved: true,
    saveUnitialized:true,
    store: MongoStore.create({
        mongoUrl: mongo_url,
        ttl: 600 //10 minutos
    }),
    cookie: {
        secure: configObject.MODE === 'production', // en true, Asegúrate de usar HTTPS en producción
        httpOnly: true, // Cookie solo accesible por el servidor
        sameSite: 'None', // Permite el envío de la cookie en contextos de terceros
    }
}))
app.use(flash());

//Acceso a los archivos estaticos 
app.use('/', express.static('./src/public/img'));
app.use('/products', express.static('./src/uploads/products'));
app.use('/profile', express.static('./src/uploads/profiles'));
app.use('/documents', express.static('./src/uploads/documents/document'));
app.use('/homeBills', express.static('./src/uploads/documents/homeBills'));
app.use('/bankBills', express.static('./src/uploads/documents/banckBills'));

//Express-handlebars
const exphbs = require("express-handlebars");
app.engine("handlebars", exphbs.engine()); //-> le digo a express que cuando encuentre un archivo con la extensión 'handlebars', use el motor de plantillas handlebars.
app.set("view engine", "handlebars");
app.set("views", "./src/views"); //-> le digo a express dopnde tiene que ir a buscar los archivos "handlebars"

//Passport
const passport = require('passport')
const initializePassport = require('./config/passport.config.js')
initializePassport()
app.use(passport.initialize())
app.use(passport.session({
    name: 'connect.sid',
    secret: 'secretPass',
    resaved: true,
    saveUnitialized:true,
    store: MongoStore.create({
        mongoUrl: mongo_url,
        ttl: 600 //10 minutos
    }),
    cookie: {
        secure: configObject.MODE === 'production', // en true, Asegúrate de usar HTTPS en producción
        httpOnly: true, // Cookie solo accesible por el servidor
        sameSite: 'None', // Permite el envío de la cookie en contextos de terceros
    }
}))

//Routing 
const productsRouter = require("./routes/products.router.js");
const cartsRouter = require("./routes/carts.router.js");
const viewsRouter = require("./routes/views.router.js");
const usersRouter = require("./routes/users.router.js");
const sessionsRouter = require("./routes/sessions.router.js");

app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/users", usersRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/", viewsRouter);

//Swagger: 
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUiExpress = require("swagger-ui-express");
const swaggerOptions = {
    definition: {
        openapi: "3.0.1",
        info: {
            title: "Documentacion del e-commerce Fantasy Store",
            description: "E-commerce para venta de productos relacionados al hogar y su equipamiento."
        }
    },
    apis: ["./src/docs/**/*.yaml"]
}
const specs = swaggerJSDoc(swaggerOptions);
app.use("/apidocs", swaggerUiExpress.serve, swaggerUiExpress.setup(specs));

app.get( "/loggerTest" , (req,res) => {
    req.logger.fatal('Mensaje de fatal desde logger /loggerTest');
    req.logger.error('Mensaje de error desde logger /loggerTest');
    req.logger.warning('Mensaje de warning desde logger /loggerTest');
    req.logger.info('Mensaje de info desde logger /loggerTest');
    req.logger.http('Mensaje de http desde logger /loggerTest');
    req.logger.debug('Mensaje de debug desde logger /loggerTest');

    res.status(200).send('loggers working')
})

//escucho el evento 'connection'
io.on("connection", async(socket) => {
    console.log(`cliente conectado!!`);

    //envio los productos al cliente conectado
    socket.emit("productos", await productsModel.find());

    //Evento para refrescar los productos
    socket.on('refreshProds', async() =>{

        //una vez agregado el producto desde el back, volvemos a enviar el array de productos
        io.sockets.emit("productos", await productsModel.find());
    })
})

//Listen
server.listen(PUERTO, ()=>{
    console.log(`Escuchando el puerto http://localhost:${PUERTO}`)
})