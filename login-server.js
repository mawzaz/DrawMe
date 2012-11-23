var io = require('socket.io'),
    express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    mysql = require('./mysql-db.js'),
    redis = require("redis");


io = io.listen(server,{ log: false });
server.listen(8000);

app.use(express.static(__dirname + '/'));
app.use('/images', express.static(__dirname + '/'));
app.use(express.cookieParser());
app.use(express.bodyParser());

var requests = {};

var client = redis.createClient();

client.subscribe("joinGame");

client.on('message',function(channel,msg){
    switch(channel){
      case 'joinGame':
        requests[msg.id].redirect
        break;
    }
});

var setCookie = function(params){

}

app.post('/login', function(req,res){

    var nickName = req.body.nickName,
        password = req.body.password;
    
    //console.log(JSON.stringify(req.body));
    mysql.connect();
    
    mysql.select("Select nickName, password from Users where nickName ='"+nickName+"'",function(data){

        console.log(data);
        if(data[0])
            if(data[0].nickName == nickName && data[0].password == password){
                console.log("signed in sucessful");
                res.redirect('/app.html');
            }
            else{
                console.log("invalid username/password");
                //alert('Invalid username/password');
            }
        else{
            console.log("returned empty data set");
            res.redirect('index.html');
        }

        mysql.disconnect();

        
    });
    // console.log(results[0]);
    
});

app.post('/register', function(req,res){

    var firstName = req.body.firstName,
        lastName = req.body.lastName,
        nickName = req.body.nickName,
        email = req.body.email,
        password = req.body.password;

    mysql.connect();

    mysql.select("Select * from Users where nickName='"+nickName+"' or email='"+email+"'",function(data){

        console.log(data);
        if(data[0])
            console.log("Cannot register, nickname or email already exist");
        else{
            mysql.insert("Insert into Users values('"+0+"','"+firstName+"','"+lastName+"','"+nickName+"','"+email+"','"+password+"')");
            console.log("data inserted succesfully");
        }
        mysql.disconnect();
    });



    res.redirect('/index.html');
});

