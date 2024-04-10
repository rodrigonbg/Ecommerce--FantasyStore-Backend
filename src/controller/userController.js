
class userController{

    //ruta ¨/failedRegister¨, metodo GET
    async failRegister (req,res){
        res.send({error: 'registro fallido'})
    }

}

module.exports = userController;