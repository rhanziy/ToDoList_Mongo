const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const app = express();
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');
const register = require('./routes/register');
const crypto = require('crypto');






require('dotenv').config();

const mongoose = require('mongoose');


app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use('/public', express.static('public'))
app.use(methodOverride('_method'))
app.use(session({secret : '비밀코드', resave : true, saveUninitialized : false}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/register', register);


var db;


MongoClient.connect(
    process.env.DB_URL,
    { useUnifiedTopology : true},
    (error, client)=>{

    if(error) return console.log(error);
    db = client.db('todoapp');

    app.listen(process.env.PORT, function(){
        console.log('listening on 8080');
    });    
});


mongoose.connect(
    process.env.DB_URL,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
).then(()=> console.log('connected...'))
.catch((err) => console.log(err.message));





app.get('/', (req, res) => {
    res.render('index.ejs');
});

app.get('/write', (req, res) => {
    res.render('write.ejs');
});


app.post('/add', (req, res)=>{
    db.collection('counter').findOne({ name: '게시물 갯수' }, (error, result)=>{
        var totalPost = result.totalPost;
        db.collection('post').insertOne({ _id : totalPost + 1 , title : req.body.title, date : req.body.date}, (error, result)=>{
            if(error) return console.log(error);
            db.collection('counter').updateOne({ name:'게시물 갯수' }, { $inc: { totalPost:1 }}, (error, result)=>{
                if(error) return console.log(error);
                res.redirect('/list')
            })
        });
    })
});

app.get('/list', (req, res)=>{
    db.collection('post').find().toArray((error, result)=>{
        res.render('list.ejs', { posts : result });
    })
});

app.delete('/delete', (req, res)=>{
    req.body._id = parseInt(req.body._id)
    db.collection('post').deleteOne(req.body, (error, result)=>{
        if(error) console.log(error);
    })
    res.send('삭제완료');
});

app.get('/detail/:id', (req, res)=>{
    db.collection('post').findOne({ _id : parseInt(req.params.id) }, (error, result)=>{
        res.render('detail.ejs', { data : result })
    })
});



app.get('/edit/:id', (req, res)=>{
    console.log(req.params.id);
    db.collection('post').findOne({ _id: parseInt(req.params.id)}, (error, result)=>{
        res.render('edit.ejs', { post : result })
    })
});


app.put('/edit', (req, res)=>{
    db.collection('post').updateOne({ _id: parseInt(req.body.id) }, 
    { $set : { title: req.body.title, date : req.body.date} },
    function(){
        console.log('수정완료') 
        res.redirect('/list')
    });
});


app.get('/login', (req, res)=>{
    res.render('login.ejs');
});

app.post('/login', passport.authenticate('local', { failureRedirect : '/fail' }), (req, res)=>{
    res.redirect('/mypage');
});

passport.use(new LocalStrategy({
    usernameField: 'id',
    passwordField: 'pw',
    session: true,
    passReqToCallback: false,
  }, function (입력한아이디, 입력한비번, done) {
    //console.log(입력한아이디, 입력한비번);
    db.collection('users').findOne({ id: 입력한아이디 }, function (err, result) {
      if (err) return done(err)
  
      if (!result) return done(null, false, { message: '존재하지않는 아이디요' })
      if (입력한비번 == result.pw) {
        return done(null, result)
      } else {
        return done(null, false, { message: '비번틀렸어요' })
      }
    })
  }));


  passport.serializeUser(function (user, done) {
        done(null, user.id)
  });
  
  passport.deserializeUser(function (아이디, done) {
    db.collection('users').findOne({ id: 아이디 }, function (err, result) {
        done(null, result)
        console.log(result);
    })
  }); 


  app.get('/mypage', isLogIn , (req, res)=>{
        console.log(req.user);
        res.render('mypage.ejs', { user : req.user })
  })

  function isLogIn (req, res, next) { 
    if (req.user) { 
      next() 
    } 
    else { 
      res.render('login.ejs')
    } 
  } 


  app.get('/logout', (req, res, next)=>{
    req.logout(err =>{
        if(err) return next(err);
    }
    );
    res.redirect('/');
  })



  app.get('/register', (req, res)=>{
    res.render('register.ejs');
});


app.post('/register', (req, res)=>{
        db.collection('users').insertOne({ name : req.body.name , id : req.body.id, pw : req.body.pw}, (error, result)=>{
            if(error) return console.log(error);
            res.render('login.ejs');
        });
});