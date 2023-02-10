const express = require('express');
const mongoose = require('mongoose');
var bodyParser = require('body-parser');
const path = require('path');

const app = express();

const Posts = require('./Posts.js');

var session = require('express-session');

mongoose.connect('mongodb+srv://root:rxxxfPx7idwITego@cluster0.qwx8mlc.mongodb.net/shibanews?retryWrites=true&w=majority',{useNewUrlParser:true, useUnifiedTopology:true}).then(function(){
    console.log('Conectado com Sucesso');
}).catch(function(err){
    console.log(err.message);
})

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({
    extended:true
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


//rota para sessao administrador
app.get('/admin/login',(req,res)=>{
    if(req.session.login == null){
        res.render('admin-login',);
    }else{
        res.render('admin-panel');
    }
    
})

app.listen(5000,()=>{
    console.log(('Servidor Rodando!'));
})