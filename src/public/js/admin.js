//instancia de socket cliente 
const socket = io();

//Funcion para agregar producto. El prod se envia desde el formulario solo vacía los campos y emite el evento de recargar la pagina 
const agregarProducto = () =>{

    //El prod se manda desde el form, solo refrescamos
    socket.emit("refreshProds",null); 

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
        card.classList.add("realTimeProd");

        //clase condicional
        if(prod.status){
            card.classList.add("statusTrue");
        }else{
            card.classList.add("statusFalse");
        }

        //creo el contenido de la card
        card.innerHTML= `
            <form action="/api/products/admin/${prod._id}" method="POST">
                <p><span>ID</span> : ${prod._id}</p>
                <p><span>TITULO</span> : ${prod.title}</p>
                <p><span>PRECIO</span> : ${prod.price}</p>
                <p><span>ESTADO</span> : ${prod.status}</p>
                <p><span>OWNER</span> : ${prod.owner}</p>
                <button> Eliminar Producto </button>
            </form>`;

        //agrego la card al contenedor
        productsContainer.appendChild(card);

    });
}

//escucho el evento 'productos' del server para renderizar los productos
socket.on('productos', (productosRecibidos)=> {
    renderProds(productosRecibidos)
});

//agrego el evento al boton de agregar producto
document.getElementById("btnAdd").addEventListener("click", ()=>{
    agregarProducto()
})

function updateCategoryName() {
    const select = document.getElementById('idCategory');
    const hiddenInput = document.getElementById('categoria');
    const selectedOption = select.options[select.selectedIndex];
    hiddenInput.value = selectedOption.text;
}