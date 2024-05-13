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
        .then(()=>console.log('Mail enviado'))
        .catch((err)=> console.log('no se pudo enviar el mail ', err))
    } catch (error) {
        return error;
    }
}

const sendRecoveryPassMail = async () =>{

}

module.exports = {sendPurchaseMail, sendRecoveryPassMail}