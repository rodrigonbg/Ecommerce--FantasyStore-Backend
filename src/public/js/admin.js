//instancia de socket cliente 
const socket = io();

//Funcion para eliminar un producto, que envia el evento 'eliminarProducto' al servidor junto con el ID del prod.
const eliminarProducto = (id) => {
    socket.emit("eliminarProducto", id)
}

//Funcion para agregar producto. El prod se envia desde el formulario solo vacía los campos y emite el evento de recargar la pagina 
const agregarProducto = () =>{
/*     const producto ={
        title: document.getElementById("title").value ,
        description: document.getElementById("description").value ,
        categoria: document.getElementById("idCategory").options[document.getElementById("idCategory").selectedIndex].text,
        idCategoria: document.getElementById("idCategory").value ,
        thumbnail: document.getElementById("img").value ,
        price: document.getElementById("price").value ,
        onSale: document.getElementById("onSale").value ,
        descuento: document.getElementById("descuento").value ,
        stock: document.getElementById("stock").value ,
        code: document.getElementById("code").value ,
        status: document.getElementById("status").value === "true"
    }
    socket.emit("agregarProducto", producto); */
    socket.emit("refreshProds", producto); 

    document.getElementById("title").value = "";
    document.getElementById("description").value  = "";
    document.getElementById("img").value  = "";
    document.getElementById("price").value  = "";
    document.getElementById("descuento").value = "";
    document.getElementById("stock").value  = "";
    document.getElementById("code").value  = "";

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
                <p><span>ID</span> : ${prod._id}</p>
                <p><span>TITULO</span> : ${prod.title}</p>
                <p><span>PRECIO</span> : ${prod.price}</p>
                <p><span>ESTADO</span> : ${prod.status}</p>
                <button> Eliminar Producto </button>`;

        //agrego la card al contenedor
        productsContainer.appendChild(card);

        //Agrego el evento 'EliminarProducto'
        const btnEliminar = card.querySelector("button")
        btnEliminar.addEventListener("click", ()=>{
            eliminarProducto(prod._id)   
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

function updateCategoryName() {
    const select = document.getElementById('idCategory');
    const hiddenInput = document.getElementById('categoria');
    const selectedOption = select.options[select.selectedIndex];
    hiddenInput.value = selectedOption.text;
}