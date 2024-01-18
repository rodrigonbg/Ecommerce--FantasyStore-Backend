//instancia de socket cliente 
const socket = io();

//Funcion para eliminar un producto, que envia el evento 'eliminarProducto' al servidor junto con el ID del prod.
const eliminarProducto = (id) => {
    socket.emit("eliminarProducto", id)
}

//Funcion para agregar producto que envia el evento 'agregarProducto' al servidor junto con el prod.
const agregarProducto = () =>{
    const producto ={
        title: document.getElementById("title").value ,
        description: document.getElementById("description").value ,
        price: document.getElementById("price").value ,
        thumbnail: document.getElementById("img").value ,
        code: document.getElementById("code").value ,
        stock: document.getElementById("stock").value ,
        status: document.getElementById("status").value === "true"
    }

    socket.emit("agregarProducto", producto);
};

//funcion para renderizar productos en 'realTimeProducts' en el cntenedor de prods 
const renderProds = (productos) =>{
    //selecciono el container y lo vacío para que no se acumulen
    const productsContainer = document.getElementById("productsContainer");
    productsContainer.innerHTML= "";

    //recorro el array de prods y muestro cada item 
    productos.forEach(prod => {
        //creo el card con etiqueta div para cada elemento y le agrego la clase 'card'
        const card = document.createElement("div");
        card.classList.add("card");

        //creo el contenido de la card
        card.innerHTML= `
                <p> ID: ${prod.id}</p>
                <p> TITULO: ${prod.title}</p>
                <p> PRECIO: ${prod.price}</p>
                <button> Eliminar Producto </button>`;

        //agrego la card al contenedor
        productsContainer.appendChild(card);

        //Agrego el evento 'EliminarProducto'
        const btnEliminar = card.querySelector("button")
        btnEliminar.addEventListener("click", ()=>{
            eliminarProducto(prod.id)   
        })


    });
}

//escucho el evento 'productos' del server para renderizar los productos
socket.on('productos', (data)=> {
    renderProds(data)
});

//agrego el evento al boton de agregar producto
document.getElementById("btnAdd").addEventListener("click", ()=>{
    agregarProducto()
})