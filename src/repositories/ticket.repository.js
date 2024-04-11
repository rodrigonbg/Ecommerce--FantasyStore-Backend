const ticketModel = require("../models/tickets.model.js");

class TicketsRepository{
    
    async addTicket(amount, mail){
        const str = Math.random().toString(36).substring(2);//String randome
        const date =  new Date();

        const newTicket = new ticketModel({
            code : str,
            purchase_datetime: date,
            amount: amount,
            purchaser: mail
        })

        //guardo el nuevo ticket
        const ticket = await  newTicket.save(); 
        return `Ticket generado: ${ticket}`
    }
}

module.exports = TicketsRepository;