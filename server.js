const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const app = express();
const methodOverride = require('method-override');



app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use('/public', express.static('public'))
app.use(methodOverride('_method'))


var db;


MongoClient.connect(
    'mongodb+srv://admin:qwer1234@cluster0.h2gpnn4.mongodb.net/todoapp?retryWrites=true&w=majority',
    { useUnifiedTopology : true},
    (error, client)=>{

    if(error) return console.log(error);
    db = client.db('todoapp');

    app.listen(8080, function(){
        console.log('listening on 8080');
    });    
});





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
})

app.get('/list', (req, res)=>{
    db.collection('post').find().toArray((error, result)=>{
        res.render('list.ejs', { posts : result });
    })
})

app.delete('/delete', (req, res)=>{
    req.body._id = parseInt(req.body._id)
    db.collection('post').deleteOne(req.body, (error, result)=>{
        if(error) console.log(error);
    })
    res.send('삭제완료');
})

app.get('/detail/:id', (req, res)=>{
    db.collection('post').findOne({ _id : parseInt(req.params.id) }, (error, result)=>{
        res.render('detail.ejs', { data : result })
    })
})



app.get('/edit/:id', (req, res)=>{
    console.log(req.params.id);
    db.collection('post').findOne({ _id: parseInt(req.params.id)}, (error, result)=>{
        res.render('edit.ejs', { post : result })
    })
})


app.put('/edit', (req, res)=>{
    db.collection('post').updateOne({ _id: parseInt(req.body.id) }, 
    { $set : { title: req.body.title, date : req.body.date} },
    function(){
        console.log('수정완료') 
        res.redirect('/list')
    });
})