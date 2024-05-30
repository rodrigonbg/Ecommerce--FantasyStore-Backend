import supertest from 'supertest';
import * as chai from 'chai';
const expect = chai.expect;

//la constante "requester", quien se encargará de realizar las peticiones al servidor. 
const requester = supertest("http://localhost:9000"); 

import mongoose from 'mongoose';
const mongo_url_testing = 'mongodb+srv://rodrigonbg:AtlasPass361713@cluster0.cik8wio.mongodb.net/E-Commerce-Fantasy-Store-TESTING?retryWrites=true&w=majority';
mongoose.connect(mongo_url_testing);

import CartRepository from '../src/repositories/cart.repository.js'
import UserRepository from '../src/repositories/user.repository.js'
import ProductRepository from '../src/repositories/product.repository.js'

describe("Testing de la App web de E-Commerce Fantasy Store", () => {
    

    before(function(){
        this.cartRepository = new CartRepository()
        this.userRepository = new UserRepository()
        this.productRepository = new ProductRepository()
    })

    //1) Usuarios
    describe("Testing de Usuarios: ", () => {
        
        it("En la ruta POST /api/users creo un usuario con sus datos correctos y redirecciono a '/'.", async function (){
            const usuario = {
                first_name:'John',
                last_name:'Doe', //not required
                email:'JhonDoe@testing.com',
                age: 20,
                password: '1234',
                //cart: automatico
                //rol: default
                //resetToken: not required
            }
            
            const { statusCode, headers } = await requester.post("/api/users").send(usuario);
            expect(statusCode).to.equal(302);//Codigo de redireccionamiento
            expect(headers).to.have.property('location').to.equal('/');// se redireccionó correctamente.

            const user = await this.userRepository.getUserbyEmail('JhonDoe@testing.com')
            expect(user).to.have.property("_id");
            expect(user).to.have.property("first_name").to.equal('John');
            expect(user).to.have.property("last_name").to.equal('Doe');
        })

        it("En la ruta POST /api/users creo otro usuario con sus datos correctos y redirecciono a '/'..", async function(){
            const usuario2 = {
                first_name:'Juana',
                last_name: 'R',
                email:'Juana@testing.com',
                age: 20,
                password: '1234',
                //cart: automatico
                //rol: default
                //resetToken: not required
            }
            const { statusCode, headers } = await requester.post("/api/users").send(usuario2);
            expect(statusCode).to.equal(302);//Codigo de redireccionamiento
            expect(headers).to.have.property('location').to.equal('/');// se redireccionó correctamente.

            const user = await this.userRepository.getUserbyEmail('Juana@testing.com')
            expect(user).to.have.property("_id");
            expect(user).to.have.property("first_name").to.equal('Juana');
        })

        it("Al crear un usuario, se crea con la contraseña encriptada.", async function(){
            const user = await this.userRepository.getUserbyEmail('JhonDoe@testing.com')
            expect(user).to.have.property("password").to.not.equal('1234');
        })

        it("Los usuarios recien creado tienen rol 'usuario'.", async function(){
            const user = await this.userRepository.getUserbyEmail('JhonDoe@testing.com')
            expect(user).to.have.property("rol").to.equal('usuario');

            const user2 = await this.userRepository.getUserbyEmail('Juana@testing.com')
            expect(user2).to.have.property("rol").to.equal('usuario');
        })

        it("Los usuario recien creado tiene un carrito asignado único.", async function(){
            const user = await this.userRepository.getUserbyEmail('JhonDoe@testing.com')
            expect(user).to.have.property("cart")
            expect(user.cart.toString()).to.be.an('string')
            
            const user2 = await this.userRepository.getUserbyEmail('Juana@testing.com')
            expect(user2).to.have.property("cart")
            expect(user2.cart.toString()).to.be.an('string')

            expect(user.cart.toString()).to.not.equal(user2.cart.toString())
        })
        
        it("En la ruta GET /api/users/premium/:uid cambio entre los roles de 'usuario' y 'premium'.", async function(){
            //JhonDoe@testing.com de usuario a premium
            let user = await this.userRepository.getUserbyEmail('JhonDoe@testing.com');
            expect(user).to.have.property("rol").to.equal('usuario');
            let idUser1 = user._id;
            let resp = await requester.get(`/api/users/premium/${idUser1}`);
            expect(resp.statusCode).to.equal(302);//Codigo de redireccionamiento
            expect(resp.headers).to.have.property('location').to.equal('/');// se redireccionó correctamente.
            user = await this.userRepository.getUserbyEmail('JhonDoe@testing.com');
            expect(user).to.have.property("rol").to.equal('premium');
            
            //Juana@testing.com de usuario a premium
            let user2 = await this.userRepository.getUserbyEmail('Juana@testing.com');
            expect(user2).to.have.property("rol").to.equal('usuario');
            let idUser2 = user2._id;
            resp = await requester.get(`/api/users/premium/${idUser2}`);
            expect(resp.statusCode).to.equal(302);//Codigo de redireccionamiento
            expect(resp.headers).to.have.property('location').to.equal('/');// se redireccionó correctamente.
            user2 = await this.userRepository.getUserbyEmail('Juana@testing.com');
            expect(user2).to.have.property("rol").to.equal('premium');
            
            //Juana@testing.com de premium a usuario
            resp = await requester.get(`/api/users/premium/${idUser2}`);
            expect(resp.statusCode).to.equal(302);//Codigo de redireccionamiento
            expect(resp.headers).to.have.property('location').to.equal('/');// se redireccionó correctamente.
            user2 = await this.userRepository.getUserbyEmail('Juana@testing.com');
            expect(user2).to.have.property("rol").to.equal('usuario');
        })

        it("En la ruta POST /api/users creo un usuario admin con correo admincoder@coder.com y redirecciono a '/'.", async function (){
            const usuario = {
                first_name:'admin',
                last_name: 'Store',
                email:'admincoder@coder.com',
                age: 20,
                password: '1234',
                //cart: non
                //rol: default
                //resetToken: not required
            }
            
            const { statusCode, headers } = await requester.post("/api/users").send(usuario);
            expect(statusCode).to.equal(302);//Codigo de redireccionamiento
            expect(headers).to.have.property('location').to.equal('/');// se redireccionó correctamente.

            const user = await this.userRepository.getUserbyEmail('admincoder@coder.com')
            expect(user).to.have.property("_id");
            expect(user).to.have.property("rol").to.equal('admin');
        })
    })

    //2) Sesiones
    describe("Testing de Sesiones: ", () => {
        //Se tienen 2 usuarios en la BD, uno 'premium' y uno 'usuario'

        it("Se debe loguear el usuario y recuperar la cookie", async function (){
            const user = {
                email: "JhonDoe@testing.com",
                password: "1234"
            }

            const res = await requester.post("/api/sessions/login").send(user);
            const cookieRes = res.headers['set-cookie']['0'];
            expect(cookieRes).to.be.ok;
            this.cookieRes = cookieRes;

            const cookie = {
                name: cookieRes.split("=")['0'],
                value: cookieRes.split("=")['1']
                //si cookieRes es 'sessionId=abc123', split("=") devuelve ['sessionId', 'abc123']
            }
            expect(cookie.name).to.be.ok;
            expect(cookie.value).to.be.ok;//Chequeamos que tenga un valor
        })

        it("Se debe desolguear el usuario", async function (){
            const res = await requester.get("/api/sessions/logout").set('cookie', this.cookieRes);
            expect(res.statusCode).to.equal(302);//Codigo de redireccionamiento
            expect(res.headers).to.have.property('location').to.equal('/');// se redireccionó correctamente
        })
    })

    //3) Productos
    describe("Testing de Productos: ", () => {

        it("Me logueo como admin", async function (){
            const user = {
                email: "admincoder@coder.com",//admin
                password: "1234"
            }
            const res = await requester.post("/api/sessions/login").send(user);
            this.cookiesAdmin = res.headers['set-cookie'];//Guardo Todas las cookies
            console.log(this.cookiesAdmin)
            expect(this.cookiesAdmin).to.be.ok;
        })

        //aunq me loguee y envie las cookies, el problema es que no me detecta logueado
        it("Logueado como admin, Endpoint POST /api/products/admin debe cargar un producto con owner admin", async function (){
            const product = {
                title:'Prueba1', 
                descripcion: 'producto de prueba admin',
                categoria: 'test',
                idCategoria: 10,
                thumbnail: [],
                price: 5000,
                onSale: false,
                descuento: 0, //si esta en venta se puede poner un descuento
                stock: 55,
                //alt: not required,
                status: true,
                code:'abc123',
                //owner: automatico en 'admin'
            }
            const res = await requester.post("/api/products/admin").set('Cookie', [`${this.cookiesAdmin.join(';')}`]).send(product);
            expect(res.status).to.equal(302);//Redireccion
            expect(res.headers).to.have.property('location').to.equal('/admin');// se redireccionó correctamente.


            const prod = await this.productRepository.getProductByCode('abc123');
            console.log('proddd', prod)
            expect(prod).to.be.an('object');
            expect(prod).to.have.property("owner").to.equal('admin');
        })
        it("Logueado como admin, Endpoint DELETE /api/products/:pid debe eliminar un producto de owner admin", async function (){
            const prod = await this.productRepository.getProductByCode('abc123');
            expect(prod).to.exist;

            const res = await requester.delete(`/api/products/${prod._id}`);
            expect(res.status).to.be.equal(200)
        })

        
        
        it("Deslogueo el usuario admin", async function (){
            const res = await requester.get("/api/sessions/logout").set('Cookie', this.cookiesAdmin.join(';'));
            expect(res.statusCode).to.equal(302);//Codigo de redireccionamiento
            expect(res.headers).to.have.property('location').to.equal('/');// se redireccionó correctamente
        })
        it("Me logueo como premium", async function (){
            const user = {
                email: "jhondoe@testing.com",//premium
                password: "1234"
            }
            const res = await requester.post("/api/sessions/login").send(user)
            this.cookiesPremium = res.headers['set-cookie'];
            expect(this.cookiesPremium).to.be.ok;
        })

        //aunq me loguee y envie las cookies, el problema es que no me detecta logueado
        it("Logueado como premium, Endpoint POST /api/products/premium debe cargar un producto con owner premium", async function (){
            const product = {
                title:'Prueba2', 
                descripcion: 'producto de prueba premium',
                categoria: 'test',
                idCategoria: 10,
                thumbnail: [],
                price: 5000,
                onSale: false,
                descuento: 0, //si esta en venta se puede poner un descuento
                stock: 55,
                //alt: not required,
                status: true,
                code: 'abc124',
                //owner: automatico en 'JhonDoe@testing.com'
            }
            const res = await requester.post("/api/products/premium").set('Cookie', [this.cookiesPremium.join(';')]).send(product);
            console.log('body',res._body)
            console.log('cookies ',this.cookiesPremium.join(';'))
            
            expect(res.status).to.equal(302);//Redireccion
            expect(res.headers).to.have.property('location').to.equal('/premium');// se redireccionó correctamente.

            const prod = await this.productRepository.getProductByCode('abc124');
            expect(prod).to.exist;
            expect(prod).to.be.an('object');
            expect(prod).to.have.property("owner").to.equal('jhondoe@testing.com');
        })
        it("Logueado como premium, Endpoint POST /api/products/admin no debe dejar Publicar un producto", async function (){
            const product = {
                title:'Prueba3', 
                descripcion: 'producto de prueba premium em admin',
                categoria: 'test',
                idCategoria: 10,
                //thumbnail: not required,
                price: 5000,
                onSale: false,
                descuento: 0, //si esta en venta se puede poner un descuento
                stock: 55,
                //alt: not required,
                status: true,
                code: 'abc125',
                //owner: automatico en 'Juana@testing.com'
            }
            const res = await requester.post("/api/products/admin").set('Cookie', this.cookiesPremium.join(';')).send(product);
            expect(res.status).to.equal(403);//Redireccion

            const prod = await this.productRepository.getProductByCode('abc125');
            expect(prod).to.not.exist;
        })

        //it("Endpoint GET /api/products debe devolver un array con todos los productos", async function (){})
        //it("Endpoint GET /api/products/:pid debe devolver un array con un producto si existe", async function (){})
        //it("Logueado como premium, Endpoint DELETE /api/products/:pid debe eliminar un producto de owner premium", async function (){})
        //it("Logueado como premium, Endpoint DELETE /api/products/:pid No debe eliminar un producto de owner admin", async function (){})
        //it("Logueado como admin, Endpoint DELETE /api/products/:pid debe eliminar un producto de owner premium", async function (){})
    })
    
    //4) Carritos
/*     describe("Testing de Carritos: ", () => {
        it("Endpoint POST /api/carts/ debe crear un carrito vacío si se está logueado como admin", async function (){})
        it("Endpoint POST /api/carts/ NO debe crear un carrito si se está logueado como user", async function (){})
        it("Endpoint POST /api/carts/ NO debe crear un carrito si se está logueado como premium", async function (){})
        
        it("Endpoint DELETE /api/carts/:cid debe elimianar el carrito si se está logueado como admin", async function (){})
        it("Endpoint DELETE /api/carts/:cid NO debe elimianar el carrito si se está logueado como usuario", async function (){})
        it("Endpoint DELETE /api/carts/:cid NO debe elimianar el carrito si se está logueado como premium", async function (){})
        
        it("Endpoint POST /api/carts/:cid/products/:pid agrega pid a cid", async function (){})
        it("Endpoint POST /api/carts/:cid/products/:pid NO agrega pid a cid si pid es incorrecto", async function (){})
        it("Endpoint POST /api/carts/:cid/products/:pid NO agrega pid a cid si cid es incorrecto", async function (){})
    }) */
    
    after(async function(){
        await mongoose.connection.collections.carts.drop()
        await mongoose.connection.collections.products.drop()
        await mongoose.connection.collections.users.drop()
        await mongoose.disconnect();
    })

})
