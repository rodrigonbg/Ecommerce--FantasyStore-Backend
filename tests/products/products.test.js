const mongoose = require('mongoose');
const assert = require('assert');
const ProductRepository = require('../../src/repositories/product.repository.js')

const mongo_url_testing = 'mongodb+srv://rodrigonbg:AtlasPass361713@cluster0.cik8wio.mongodb.net/E-Commerce-Fantasy-Store-TESTING?retryWrites=true&w=majority';
mongoose.connect(mongo_url_testing);

describe('Testing de módulo de productos.', async function(){

    //Instancio el repositorio de cart para usar sus funciones.
    before(function(){
        this.productRepository = new ProductRepository()
    })

    //Limpio la BD entre test y test.
    beforeEach(async function(){
        await mongoose.connection.collections.products.drop()
    })

    it('Puedo agregar un producto a la BD.', async function(){
        const product = {
            title:'producto testing', 
            description: 'Producto agregado para testear el funcionamiento de la función.',
            categoria: 'testing',
            idCategoria: 10,
            thumbnail: [],
            price: 5000,
            onSale: false,
            descuento: 0,
            stock: 10,
            //alt: not required,
            status: true,
            code: 'abc1234',
            //owner: default:'admin'}
        }
        
        const result = await this.productRepository.addProduct(product);
        assert.ok(result, 'El resultado no debe ser null o undefined');
    })

    it('Si agrego 2 productos con el mismo codigo, tengo un error.', async function(){
        const product1 = {
            title:'producto testing 1', 
            description: 'Producto agregado para testear el funcionamiento de la función.',
            categoria: 'testing',
            idCategoria: 10,
            //thumbnail: not required
            price: 5000,
            onSale: false,
            descuento: 0, //si esta en venta se puede poner un descuento
            stock: 10,
            //alt: not required,
            status: true,
            code: 'abc1234',
            //owner: default:'admin'}
        }
        const result1 = await this.productRepository.addProduct(product1);
        assert.ok(result1, 'El resultado no debe ser null o undefined');
        
        const product2 = {
            title:'producto testing 2', 
            description: 'Producto agregado para testear el funcionamiento de la función.',
            categoria: 'testing',
            idCategoria: 10,
            //thumbnail: not required
            price: 5000,
            onSale: false,
            descuento: 0, //si esta en venta se puede poner un descuento
            stock: 10,
            //alt: not required,
            status: true,
            code: 'abc1234',
            //owner: default:'admin'}
        }
        let error;
        try {
            await this.productRepository.addProduct(product2);
        } catch (err) {
            error = err;
        }
        assert.ok(error, 'Se esperaba que se lanzara un error');
        assert.equal(error.message, 'El código debe ser único.\n');
        
    }) 

    it('Puedo recuperar uno o mas productos usando el mail del owner', async function(){
        const product = {
            title:'producto testing ', 
            description: 'Producto agregado para testear el funcionamiento de la función.',
            categoria: 'testing',
            idCategoria: 10,
            //thumbnail: not required
            price: 5000,
            onSale: false,
            descuento: 0, //si esta en venta se puede poner un descuento
            stock: 10,
            //alt: not required,
            status: true,
            code: 'abc1234',
            owner: 'prueba@prueba.com'
        }
        const result = await this.productRepository.addProduct(product);
        assert.ok(result, 'El resultado no debe ser null o undefined');
        
        const prod = await this.productRepository.getProductsByOwner('prueba@prueba.com');

        assert.ok(prod[0]._id);
    }) 

    it('Puedo recuperar un producto con su id', async function(){
        const product = {
            title:'producto testing ', 
            description: 'Producto agregado para testear el funcionamiento de la función.',
            categoria: 'testing',
            idCategoria: 10,
            //thumbnail: not required
            price: 5000,
            onSale: false,
            descuento: 0, //si esta en venta se puede poner un descuento
            stock: 10,
            //alt: not required,
            status: true,
            code: 'abc1234',
        }
        const result = await this.productRepository.addProduct(product);
        assert.ok(result, 'El resultado no debe ser null o undefined');
        const id = result._id;

        const prod = await this.productRepository.getProductById(id);

        assert.equal(prod._id.toString(), id.toString());
    }) 

    after(async function(){
        await mongoose.disconnect();
    })

})