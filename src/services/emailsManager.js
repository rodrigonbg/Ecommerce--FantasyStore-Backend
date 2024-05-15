const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    auth:{
        user: 'rodrigonbg2@gmail.com',
        pass: 'eavo dlui ffby jvia'
    }
});

const sendPurchaseMail = async (mailToSend, firstName, ticket) =>{
    try {
        const mail = {
            from:'FantasyStore < Rodrigonbg2@gmail.com >',
            to: mailToSend,
            subject: 'Confirmacion de compra!',
            html:   `<div>
                        <h1>Gracias por tu compra ${firstName}!!!</h1>
                        <p>Tu número de orden es: ${ticket.code}</p>
                    </div>`,
        };
        await transporter.sendMail(mail)
        .then(()=>console.log('Mail de compra enviado'))
        .catch((err)=> console.log('no se pudo enviar el mail de compra ', err))
    } catch (error) {
        return error;
    }
}

const sendRecoveryPassMail = async (mailToSend, firstName, token) =>{
    try {
        const mail = {
            from:'FantasyStore < Rodrigonbg2@gmail.com >',
            to: mailToSend,
            subject: 'Restablecimiento de contraseña!',
            html:   `<div>
                        <h1>Restablecimiento de contraseña</h1>
                        <p>${firstName}, has solicitado restablecer tu contraseña. para esto utiliza el siguiente código: </p>
                        <p><strong>${token}</storng></p>
                        <a href='http://localhost:8080/password' >Establecer nueva contraseña</a>
                        <p>Este link tiene solamente 1 hora de validez.</p>
                        <p>Si no solicitaste este restablecimiento, ignora este correo.</p>
                    </div>`,
        };
        await transporter.sendMail(mail)
        .then(()=>console.log('Mail de restablecimiento enviado'))
        .catch((err)=> console.log('no se pudo enviar el mail de restablecimiento ', err))
    } catch (error) {
        return error;
    }
}

module.exports = {sendPurchaseMail, sendRecoveryPassMail}