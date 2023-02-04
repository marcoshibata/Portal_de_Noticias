const express = require('express');
const mongoose = require('mongoose');
var bodyParser = require('body-parser');
const path = require('path');

const app = express();

const Posts = require('./Posts.js');

mongoose.connect('mongodb+srv://root:rxxxfPx7idwITego@cluster0.qwx8mlc.mongodb.net/shibanews?retryWrites=true&w=majority',{useNewUrlParser:true, useUnifiedTopology:true}).then(function(){
    console.log('Conectado com Sucesso');
}).catch(function(err){
    console.log(err.message);
})

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
        Posts.find({}).sort({'_id': -1}).exec(function(err,posts){
            //console.log(posts[0]);
            posts = posts.map(function(val){
                return{
                    titulo: val.titulo,
                    conteudo: val.conteudo,
                    descricaoCurta: val.conteudo.substr(0,100),
                    imagem: val.imagem,
                    slug: val.slug,
                    categoria: val.categoria
                }
            })
            res.render('home',{posts:posts});
            })
        
        
    }else{
        res.render('busca',{});
    }
});

app.get('/:slug',(req,res)=>{
    //res.send(req.params.slug);
    Posts.findOneAndUpdate({slug: req.params.slug},{$inc:{views:1}},{new:true},function(err,resposta){
        console.log(resposta);
        res.render('single',{noticia:resposta});
    })
    
})

app.listen(5000,()=>{
    console.log(('Servidor Rodando!'));
})