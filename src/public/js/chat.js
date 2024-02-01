//instancia de socket cliente 
const socket = io();

let userMail

Swal.fire({
    title: 'LOG IN',
    input: 'text',
    text: 'ingresa to correo electronico',
    inputValidator: (value) =>{
        return !value && 'Necesitas ingresar tu correo para continuar.'
    },
    allowOutsideClick: false,
}).then((res) => {
    userMail = res.value.toLocaleLowerCase();
    console.log('aloo')

    //emito un load para que el servidor cargue los mensajes.
    socket.emit('loadMsgs', null);
})


//Funcion para renderizar mensajes 
const renderMsg = (msgs)=> {
    const msgsContainer = document.getElementById("msgContainer");
    msgsContainer.innerHTML= "";

    //recorro el array de mensajes y muestro cada uno
    msgs.forEach(msg => {
        //creo el card con etiqueta div para cada elemento y le agrego la clase 'msg'
        const msgCard = document.createElement("div");
        msgCard.classList.add("msg");

        //clase condicional
        if(msg.user == userMail){
            msgCard.classList.add("myMsg");
        }else{
            msgCard.classList.add("otherMsg");
        }

        //creo el contenido de la card
        msgCard.innerHTML= `
                <p class='mail'> ${msg.user} </p>
                <p>${msg.message}</p>`;

        //agrego la card al contenedor
        msgsContainer.appendChild(msgCard);
    });
}

//Funcion para enviar mensaje
const sendMsg = () =>{
    const msg ={
        user: userMail,
        message: document.getElementById("message").value ,
    }

    socket.emit("newMessage", msg);

    document.getElementById("message").value = "";
};

//escucho el evento 'messages' del server para renderizar los mensajes
socket.on('messages', (data)=> {
    renderMsg(data)

    //cada vez que se renderiza, hago scrollDown en el container de mensajes
    document.getElementById("msgContainer").scrollBy({
        top: window.innerHeight,
        behavior: 'smooth'
    });
}); 

//agrego el evento al boton de enviar mensaje
document.getElementById("btnSend").addEventListener("click", (e)=>{
    e.preventDefault();  
    sendMsg()
})