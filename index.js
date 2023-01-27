const express = require('express');
var bodyParser = require('body-parser');
const path = require('path');

const app = express();

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({
    extended:true
}));

//rotas express com ejs
app.engine('html',require('ejs').renderFile);
app.set('view engine','html');
app.use('/public',express.static(path.join(__dirname,'public')));
app.set('views',path.join(__dirname,'pages'));



// rotas de busca
app.get('/',(req,res)=>{

if(req.query.busca == null){
    res.render('Home',{});
}else{
    res.render('busca',{});
}
})

app.get('/:slug',(req,res)=>{
    //res.send(req.params.slug);
    res.render('single',{});
})

app.listen(5000,()=>{
    console.log(('Servidor Rodando!'));
})