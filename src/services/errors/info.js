//Info es una pequeña funcion me me va a mostrar donde esta el error.

const infoErrorCrearProducto = (prod) => {
    return `Ocurrió un error al crear el producto.
    Hay datos que estan incompletos o no son válidos. 
    Necesitamos recibir los siguientes datos: 
    - title: String. Dato recibido-->  ${prod.title}
    - description: String. Dato recibido-->  ${prod.descripcion}
    - categoría: String. Dato recibido-->  ${prod.categoria}
    - idCategoria: Number. Dato recibido-->  ${prod.idCategoria}
    - price: Number. Dato recibido-->  ${prod.price}
    - onSale: Boolean. Dato recibido-->  ${prod.onSale}
    - descuento: Number. Dato recibido-->  ${prod.descuento}
    - stock: Number. Dato recibido-->  ${prod.stock}
    - code: String. Dato recibido-->  ${prod.code}
    `
}

const infoErrorCrearUser = (usuario) => {
    return ` Ocurrió un error al crear el Usuario.
    Hay datos que estan incompletos o no son válidos. 
    Necesitamos recibir los siguientes datos: 
    - first_name: String. Dato recibido-->  ${usuario.first_name}
    - last_name: String. Dato recibido-->  ${usuario.last_name} (Dato no obligatorio)
    - email: String. Dato recibido-->  ${usuario.email}
    - age: Number. Dato recibido-->  ${usuario.age} (Dato no obligatorio)
    - password: String. Dato ${usuario.password? 'Recibido' : 'No recibido'}
    - cart: MongoID. Dato recibido-->  ${usuario.cart} (Dato no obligatorio en caso de admin)
    - rol: string 'adimn' o 'usuario'. Dato recibido-->  ${usuario.rol}
    `
}

//Prod y cart booleanos
const infoErrorAgregarACarrito = (pid, cid, prod, cart) => {
    return ` Los datos estan incompletos o no son válidos. 
    Necesitamos recibir los siguientes datos: 
    - Id del producto: string, number. Dato recibido-->  ${pid}
    - Id del carrito:string, number. Dato recibido-->  ${cid}
    - Existencia del carrito: ${cart? 'Si se encontró el carrito' : 'No se encontró el carrito'}
    - Existencia del producto: ${prod? 'Si se encontró el producto' : 'No se encontró el producto'}
    `
}

module.exports = {infoErrorCrearProducto, infoErrorCrearUser, infoErrorAgregarACarrito}