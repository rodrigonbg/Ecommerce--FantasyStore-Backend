const {faker} = require('@faker-js/faker')

const generarProducto = ()=>{

    const prod = {
        title: faker.commerce.productName(),
        descripcion: faker.commerce.productDescription(),
        categoria: faker.commerce.department(),
        idCategoria: parseInt(faker.commerce.price({ min: 1, max: 6 })),
        thumbnail: [faker.image.url(),faker.image.url()],
        price: parseInt(faker.commerce.price({ min: 100, max: 100000 })),
        stock: parseInt(faker.commerce.price({ min: 0, max: 500 })),
        alt: faker.commerce.product(),
        status: booleanValue = faker.datatype.boolean(),
        code: faker.commerce.isbn(10),
        descuento : parseInt(faker.commerce.price({ min: 0, max: 99 }))
    }
    let onSale = (prod.descuento > 0)? true : false;
    prod.onSale = onSale;

    return prod
}

module.exports = generarProducto;