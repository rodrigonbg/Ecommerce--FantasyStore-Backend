const {Command} = require('commander');
const program = new Command();

program
    .option('-p <port>', 'Puerto de escucha', null) 
    // por defecto en null, si no lo especifico,que tome el del .env
    .option('--mode <mode>','Modo de trabajo', 'production')
    //Puede ser production or developmnet. por defecto, production 
program.parse();

//Con program.opts() obtengo las opciones que se pasan por la línea de comandos

module.exports = program;