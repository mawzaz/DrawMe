var io = require('socket.io'),
    express = require('express'),
    app = express(),
    server = require('http').createServer(app),
//    mysql = require('./mysql-db.js'),
    redis = require("redis"),
    passport = require("passport"),
    LocalStrategy = require("passport-local").Strategy,
    util = require("util"),
    user = require("./User.js");



io = io.listen(server,{ log: false });
server.listen(8000);

app.use(express.static(__dirname + '/'));
app.use('/images', express.static(__dirname + '/'));
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.session({secret : "ECSE FTW"})),
app.use(passport.initialize()),
app.use(passport.session());

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
passport.serializeUser(function(user, done) {
    console.log("Serializing user: " + user);
    done(null, JSON.stringify({_id : user._id, nickname: user.nickname}) );
});

passport.deserializeUser(function(user, done) {
    console.log("User deserialized, id: "+user);
    done(null, JSON.parse(user));
});


passport.use(new LocalStrategy(
    function(username, password, done)
    {
        user.validateUser(username, password, function(err, user)
        {
            if (err) {return done(err);}
            if (!user)
            {
                console.log(util.format("Unsuccessful login attempt. User: %s, Password: %s", username, password));
                return done(null, false, {message: "Incorrect username/password."});
            }
            console.log(util.format("Successful login attempt. User: %s", username));
            
            return done(null, user);    
            
        });
    }));
    
var requests = {};

var client = redis.createClient();

var channelName = "joinGame";
client.subscribe(channelName);

var client2 = redis.createClient();



client.on('message',function(channel,msg){
    switch(channel){
      case 'joinGame':
        requests[msg.id].redirect(msg.url)
        break;
    }
});


app.post('/login', 
    //passport.authenticate('local'), 
    function (req, res)
    {
        res.redirect("/menu.html");
    //    res.redirect("app.html");                             
    });

app.post("/test", function(res, req)
{
    console.log(req.user);
});

app.post('/random_game', function(req, res)
{
    if (req.user)
    {
        console.log("User logged in, joining random server");
        client2.publish("randomGame", req.user);
    }
    else
    {
        console.log("No user logged in");
    }
});
    


app.post('/register', function(req,res){
    

    res.redirect('/index.html');
});

//===================Getting the user stats===================
app.post('/mystats', function(req,res){

    console.log('app.post("/mystats")');

    user.getStats('test1',function(err,data){

        if(data){
            console.log("Got data for stats");
            res.writeHead(200, {"Content-Type":'application/json'});
            res.write(JSON.stringify(data));
            res.end();
        }
        else{
            console.log('not done');
            res.redirect('menu.html');
        }
    });
});
//===================Getting the user stats===================//

//===================Getting the account form===================
app.post('/myaccount', function(req,res){

    console.log('app.post("/myaccount")');

    user.getAccount('test1', function(err,data){

        if(data){
            console.log("Got data for account");
            res.writeHead(200,{"Content-Type":'application/json'});
            res.write(JSON.stringify(data));
            res.end();
        }
    });
});
//===================Getting the account form===================//

//===================Parsing the account form===================
app.post('/changeAccount', function(req,res){
    
    console.log('app.post("/changeAccount"');
    console.log('nickname: '+req.body.nickname);

    user.changeAccount(req.body.nickname,req.body.password, function(err,data){
        if(data){
            res.redirect('/menu.html');
        }else{
            console.log('something went wrong');
        }
    });

    // res.writeHead(200,{'Content-Type':'text/javascript'});
    // res.end();
    // res.redirect('/myaccount');
});
//===================Parsing the account form===================

/*app.post('/playnow',function(req,res){
    //1.get id of the user
        // If not 401
        
        // Otherwise 
    //2.publish to randomGame via redis
    
    
    //requests[id] = res;
    
});*/