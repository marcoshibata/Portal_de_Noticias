const express = require('express');
const mongoose = require('mongoose');
const fileupload =require('express-fileupload');
var bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();

const Posts = require('./Posts.js');

var session = require('express-session');
const fileUpload = require('express-fileupload');

mongoose.connect('mongodb+srv://root:rxxxfPx7idwITego@cluster0.qwx8mlc.mongodb.net/shibanews?retryWrites=true&w=majority',{useNewUrlParser:true, useUnifiedTopology:true}).then(function(){
    console.log('Conectado com Sucesso');
}).catch(function(err){
    console.log(err.message);
})

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({
    extended:true
}));

app.use(fileUpload({
    useTempFiles:true,
    tempFileDir:path.join(__dirname,'temp')
}));

// usando express-session para criar sessoes
app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }}));

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

            Posts.find({}).sort({'views': -1}).limit(3).exec(function(err,postsTop){
                //console.log(posts[0]);
                posts = posts.map(function(val){
                    return{
                        titulo: val.titulo,
                        conteudo: val.conteudo,
                        descricaoCurta: val.conteudo.substr(0,100),
                        imagem: val.imagem,
                        slug: val.slug,
                        categoria: val.categoria,
                        views: val.views
                    }
                }) 
                res.render('home',{posts:posts, postsTop:postsTop});
            })

            
        })
        
        
    }else{

        Posts.find({titulo:{$regex:req.query.busca, $options:"i"}},function(err,posts){
            console.log(posts);
            posts = posts.map(function(val){
                return{
                    titulo: val.titulo,
                        conteudo: val.conteudo,
                        descricaoCurta: val.conteudo.substr(0,100),
                        imagem: val.imagem,
                        slug: val.slug,
                        categoria: val.categoria,
                        views: val.views
                }
            })
            res.render('busca',{posts:posts, contagem:posts.length});
        })
        
    }
});

app.get('/:slug',(req,res)=>{
    //res.send(req.params.slug);
    Posts.findOneAndUpdate({slug: req.params.slug},{$inc:{views:1}},{new:true},function(err,resposta){
        //console.log(resposta);
        if(resposta != null){
            Posts.find({}).sort({'views':-1}).limit(3).exec(function(err,postsTop){
                postsTop = postsTop.map(function(val){
                    return{
                        titulo: val.titulo,
                        conteudo: val.conteudo,
                        descricaoCurta: val.conteudo.substr(0,100),
                        imagem: val.imagem,
                        slug: val.slug,
                        categoria: val.categoria,
                        views: val.views
                    }
                })
                res.render('single',{noticia:resposta, postsTop:postsTop});
            })  
        }else{
            res.redirect('/');
        }     
    })
    
})

//usuarios dentro de array
var usuarios = [
    {
        login: 'Marco',
        senha: '123456'
    }
]

//comparando a senha 
app.post('/admin/login',(req,res)=>{
    usuarios.map(function(val){
        if(val.login == req.body.login && val.senha == req.body.senha){
            req.session.login = "Shibatex";
            
        }
    })
    res.redirect('/admin/login')
})

//rota para postar noticia
app.post('/admin/cadastro',(req,res)=>{
    
    let formato = req.files.arquivo.name.split('.');
    var imagem = "";
    if(formato[formato.length - 1]== "png"){
        imagem = new Date().getTime()+'.png';
        req.files.arquivo.mv(__dirname+'/public/images/'+imagem);
    }else{
        //deleta a imagem caso nao corresponda as expectativas
        fs.unlinkSync(req.files.arquivo.tempFilePath);
    }

    Posts.create({
        titulo: req.body.titulo_noticia,
        imagem:'http://localhost:5000/public/images/'+imagem,
        categoria:req.body.categoria,
        conteudo:req.body.noticia,
        slug:req.body.slug,
        autor: req.body.autor,
        views: 0
    })
    res.redirect('/admin/login');

})

//rota para deletar
app.get('/admin/deletar/:id',(req,res)=>{
    Posts.deleteOne({_id:req.params.id}).then(function(){
        res.redirect('/admin/login');
    })
    
})

//rota para sessao administrador
app.get('/admin/login',(req,res)=>{
    if(req.session.login == null){
        res.render('admin-login',);
    }else{
        Posts.find({}).sort({'_id': -1}).exec(function(err,posts){
            //console.log(posts[0]);
            posts = posts.map(function(val){
                return{
                    id:val._id,
                    titulo: val.titulo,
                    conteudo: val.conteudo,
                    descricaoCurta: val.conteudo.substr(0,100),
                    imagem: val.imagem,
                    slug: val.slug,
                    categoria: val.categoria,
                    views: val.views
                }
            }) 
            res.render('admin-panel',{posts:posts});
            console.log(posts);
        }) 
        
    }
    
})

app.listen(5000,()=>{
    console.log(('Servidor Rodando!'));
})