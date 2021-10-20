const express = require('express');
const app = express();
app.use(express.urlencoded({extended: true}));
const MongoClient = require('mongodb').MongoClient;
app.set('view engine', 'ejs');

app.set('/public', express.static('public'));

const methodOverride = require('method-override');
app.use(methodOverride('_method'));

var db;
MongoClient.connect('mongodb+srv://admin:qwer1234@cluster0.gwbya.mongodb.net/todoapp?retryWrites=true&w=majority',
 function(err, client) {
   
    if(err) return console.log(err);

    db = client.db('todoapp'); //db명 todoapp

    app.listen(8080 , function(){
        console.log('listening on 8080');
    });
});




// app.get('/', function(req, res) {
//     res.sendFile(__dirname + '/index.html');  
// });

// app.get('/write', function(req, res) {
//     res.sendFile(__dirname + '/write.html');  
// });

app.post('/add', function(요청, 응답){
    응답.send('전송완료');

    db.collection('counter').findOne({name : '게시물갯수'}, function (에러, 결과) {
        console.log(결과.totalPost);
        var count = 결과.totalPost;

        db.collection('post').insertOne( { _id : count + 1 ,제목 : 요청.body.title, 날짜 : 요청.body.date } , function(){
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

app.get('/write', function (요청, 응답) {
    응답.render('write.ejs');
});

app.get('/', function (요청, 응답) {
    응답.render('index.ejs');
});


app.delete('/delete', function (요청, 응답) {
    console.log(요청.body);
    요청.body._id = parseInt(요청.body._id);
    db.collection('post').deleteOne(요청.body, function (에러, 결과) {
        console.log('삭제완료');
        응답.status(200).send({ message : '성공했습니다.'});
    });
});

// /detail로 접속하면 detail.ejs 보여줌

app.get('/detail/:id', function (요청, 응답) {
    db.collection('post').findOne({_id : parseInt(요청.params.id) }, function (에러, 결과) {
        console.log(결과);
        응답.render('detail.ejs', {data : 결과});
        })
    })
    
app.get('/edit/:id', function (요청, 응답) {
    
    db.collection('post').findOne({_id : parseInt(요청.params.id)}, function(에러, 결과) {
        console.log(결과);
        응답.render('edit.ejs', { editpost : 결과});
    })
    
})

app.put('/edit', function(요청, 응답) {
    // 폼에 담긴 데이터들(제목,날짜)을 가지고 Db.collection 에다가
    // 업데이트함

    db.collection('post').updateOne({_id : parseInt(요청.body.id) },{ $set : {제목 : 요청.body.title , 날짜 : 요청.body.date }}, function (에러, 결과) {
        console.log('수정완료');
        응답.redirect('/list');
        
    })
})

//로그인 파트

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

app.use(session({secret : '비밀코드', resave : true, saveUninitialized : false}));
app.use(passport.initialize());
app.use(passport.session());


app.get('/login', function(요청, 응답) {
    응답.render('login.ejs');
})

app.post('/login', passport.authenticate('local', {
    failureRedirect : '/fail'
}), function(요청, 응답) {
    
    응답.redirect('/');
});

passport.use(new LocalStrategy({
    usernameField: 'id',
    passwordField: 'pw',
    session: true,
    passReqToCallback: false,
  }, function (입력한아이디, 입력한비번, done) {

    console.log(입력한아이디, 입력한비번);

    db.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) {
      if (에러) return done(에러)
  
      if (!결과) return done(null, false, { message: '존재하지않는 아이디요' })
      if (입력한비번 == 결과.pw) {
        return done(null, 결과)
      } else {
        return done(null, false, { message: '비번틀렸어요' })
      }
    })
  }));

  passport.serializeUser(function(user, done) {
      done(null, user.id)
  });
  passport.deserializeUser(function(아이디, done) {
      done(null, {})
  });

