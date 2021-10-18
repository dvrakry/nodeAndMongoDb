const express = require('express');
const app = express();
app.use(express.urlencoded({extended: true}));
const MongoClient = require('mongodb').MongoClient;
app.set('view engine', 'ejs');

var db;
MongoClient.connect('mongodb+srv://admin:qwer1234@cluster0.gwbya.mongodb.net/todoapp?retryWrites=true&w=majority', function(에러, client) {
   
    if(에러) return console.log(에러);

    db = client.db('todoapp');

    app.listen(8080 , function(){
        console.log('listening on 8080')
    });
});



app.get('/pet', function(req, res){
    res.send('펫 용품을 쇼핑할수 있는 페이지 입니다.');
});

app.get('/beauty', function(req, res) {
    res.send('미용 제품을 쇼핑할 수 있는 페이지 입니다.');   
});

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');  
});

app.get('/write', function(req, res) {
    res.sendFile(__dirname + '/write.html');  
});

app.post('/add', function(요청, 응답){
    응답.send('전송완료');

    db.collection('counter').findOne({name : '게시물갯수'}, function (에러, 결과) {
        console.log(결과.totalPost);
        var 총게시물갯수 = 결과.totalPost;

        db.collection('post').insertOne( { _id : 총게시물갯수 + 1 ,제목 : 요청.body.title, 날짜 : 요청.body.date } , function(){
            console.log('저장완료')
            
            // counter 라는 콜렉션에 있는 totalPost 라는 항목도 1 증가시켜야함
            db.collection('counter').updateOne({name : '게시물갯수'},{ $inc : {totalPost : 1}},function (에러, 결과) {
                if(에러){return console.log(에러)}
                console.log('업데이트완료');
            });
        });



    });
  });


// /list 로 get요청으로 접속하면
// 실제 DB에 저장된 데이터들로 예쁘게 꾸면진 HTML을 보여줌

app.get('/list', function (요청, 응답) {
    
    db.collection('post').find().toArray(function(에러, 결과) {

        console.log(결과);
        응답.render('list.ejs', {posts : 결과});  //posts 라는 이름으로 결과값을 담아서 list.ejs로 감 
    });
    //수정
});

