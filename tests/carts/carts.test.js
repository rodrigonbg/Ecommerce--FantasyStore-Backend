const mongoose = require('mongoose');
const assert = require('assert');
const { ObjectId } = require('mongodb');

const CartRepository = require('../../src/repositories/cart.repository.js')

const mongo_url_testing = 'mongodb+srv://rodrigonbg:AtlasPass361713@cluster0.cik8wio.mongodb.net/E-Commerce-Fantasy-Store-TESTING?retryWrites=true&w=majority';

mongoose.connect(mongo_url_testing);

return describe('Testing de módulo de carts.', async function(){

    //Instancio el repositorio de cart para usar sus funciones.
    before(function(){
        this.cartRepository = new CartRepository()
    })

    //Limpio la BD entre test y test.
    beforeEach(async function(){
        await mongoose.connection.collections.carts.drop()
    })

    it('El get de carrito me debe retornar un array.', async function(){
        const result = await this.cartRepository.getCarts();
        assert.equal(Array.isArray(result), true);
    })
    
    it('Al crear un carrito, por defecto se crea un objeto que contiene la propiedad "product" con un array vacío.', async function(){
        const cart = await this.cartRepository.createCart();
        assert.equal(cart !== null && typeof cart === 'object', true); //Se crea el objeto padre
        assert.equal(Array.isArray(cart.products), true); //Se crea el array
        assert.equal(cart.products.length, 0);//el array está vacío.
    })
    
    it('Al crear un carrito, se crea in _id automaticamente.', async function(){
        const cart = await this.cartRepository.createCart();
        assert.equal(cart !== null && typeof cart === 'object', true); //Se crea el objeto padre
        assert.equal(cart._id !== null && cart._id instanceof ObjectId, true); //Se crea el iD
    })
    
    it('Obtengo correctamente un carrito con su id', async function(){
        const newCart= await this.cartRepository.createCart();
            
        // Verificar que newCart tiene un _id
        assert.ok(newCart._id, 'newCart debe tener un _id');
        const cartID = newCart._id;

        //Obtengo el carrio por su id
        const cart = await this.cartRepository.getCartbyId(cartID);

        // Verificar que cart no es null o undefined
        assert.ok(cart, 'No se pudo recuperar ninugun carrito.');
        
        //verfico que el carrito sea el correcto
        assert.equal(cart._id.toString(), cartID.toString()); 
    })

    after(async function(){
        await mongoose.disconnect();
    })

})