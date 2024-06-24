const TicketsModel = require("../models/tickets.model.js");

class TicketsRepository{
    
    async addTicket(amount, mail, prods){
        try {

            if(!amount || !mail || !prods){
                const error = new Error()
                error.message = `Datos insuficientes para generar el ticket de compra.`
                error.name('Error de datos')
                throw error
            }
            if(! Array.isArray(prods)){
                const error = new Error()
                error.message = `Mal formato de productos.`
                error.name('Error de datos')
                throw error
            }
            if(prods.length === 0){
                const error = new Error()
                error.message = `Es necesario algun producto para finalizar la compra.`
                error.name('Error de datos')
                throw error
            }

            const str = Math.random().toString(36).substring(2);//String random
            const date =  new Date();

            const newTicket = new TicketsModel({
                code : str,
                purchase_datetime: date,
                amount: amount,
                purchaser: mail,
                products: prods
            })
    
            const ticket = await newTicket.save().then(res => res).catch(err => err); 
            return ticket
        } catch (error) {
            throw error
        }
    }

    async getTickets(){
        try {
            const tickets = await TicketsModel.find()
            return tickets
        } catch (error) {
            throw error
        }
    }

    async getTicketByPurchaser(email){
        try {
            const tickets = await TicketsModel.find({ purchaser: email.toString() })
            return tickets
        } catch (error) {
            throw error
        }
    }
    
}

module.exports = TicketsRepository;