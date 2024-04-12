const TicketsModel = require("../models/tickets.model.js");

class TicketsRepository{
    
    async addTicket(amount, mail, prods){
        try {
            const str = Math.random().toString(36).substring(2);//String randome
            const date =  new Date();
            const newTicket = new TicketsModel({
                code : str,
                purchase_datetime: date,
                amount: amount,
                purchaser: mail,
                products: prods
            })
    
            //guardo el nuevo ticket
            const ticket = await newTicket.save().then(res => res).catch(err => err); 
            return ticket
        } catch (error) {
            return error
        }
    }

    
}

module.exports = TicketsRepository;