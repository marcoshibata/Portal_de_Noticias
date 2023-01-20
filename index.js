const express = require('express');
var bodyParser = require('body-parser');
const path = require('path');

const app = express();

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({
    extended:true
}));

// rotyas express com ejs
app.engine('html',require('ejs').renderFile);
app.set('view engine','html');
app.use('/puplic',express.static(path.join(__dirname,'puplic')));
app.set('views',path.join(__dirname,'views'));



//testando as rotas
app.get('/',(req,res)=>{
    res.send('Funcionando')
});




app.listen(5000,()=>{
    console.log(('Servidor Rodando!'));
})