var io = require('socket.io'),
    express = require('express'),
    app = express(),
    server = require('http').createServer(app),
//    mysql = require('./mysql-db.js'),
    redis = require("redis"),
    passport = require("passport"),
    LocalStrategy = require("passport-local").Strategy,
    util = require("util"),
    user = require("./js/User.js");



io = io.listen(server,{ log: false });
server.listen(8000);

app.use('/js',express.static(__dirname + '/js'));
app.use('/css',express.static(__dirname + '/css'));
app.use('/images', express.static(__dirname + '/images'));
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
    done(null, JSON.stringify({_id:user._id, nickname:user.nickname}) );
});

passport.deserializeUser(function(user, done) {
    console.log("User deserialized, id: "+user);
    done(null, JSON.parse(user));
});

app.get('/', function (req, res) {
    if (req.user)
    {
      res.redirect('/menu');
    }
    else
    {
      console.log("GETTING HTML");
      
      res.sendfile(__dirname + '/index.html');
    }
});




passport.use(new LocalStrategy(function(username, password, done){
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
    msg = JSON.parse(msg);
    switch(channel){
      case 'joinGame':
        console.log("msg = ",msg);
        var res = requests[msg.guid];
        res.writeHead(200, {
          'Content-Type': 'application/json' 
        });
        res.write(JSON.stringify(msg));
        res.end();

        delete requests[msg.guid];
        break;
    }
});

app.post('/login', passport.authenticate('local', {successRedirect:'/menu', failureRedirect:'/'}));

app.post("/test", function(res, req)
{
    console.log(req.user);
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});



app.post('/random_game', function(req, res)
{
  if (req.user)
  {
    console.log("User logged in, joining random server");
    client2.publish("randomGame", JSON.stringify({playerId : req.user._id, name:req.user.nickname}));
    requests[req.user._id] = res;
  }
  else
  {
    console.log("No user logged in");
  }
});
    

//=================Register=====================
app.post('/register', function(req,result){
  
  var email = req.body.email,
      nickname = req.body.nickname,
      pass = req.body.password,
      pass_confirm = req.body.confirmPassword;
      
  console.log("Nickname: " +nickname)
      
  user.createUser(email, nickname, pass, pass_confirm, function(err, res)
  {
    if(err)
    {
      // Something bad happened
      console.log(err);
    }  
    else if (res)
    {
      console.log(res);
      req.login(res, function(err){
        if(err)
        {
          console.error("Error during login redirect");
          console.error(err.stack);
        }
        else
        {
          result.redirect("/menu");
        }
      });
      
    }
    else if (!res)
    {
      // User already exists
      //TODO: Notify frontend
      result.redirect("/");
    }
  });

});
//=================Register=====================//

//===================Logout===================
app.get('/logout', function(req,res){

    console.log('Logging out');
    req.logout();
    res.redirect('/index.html');
    
});
//===================Logout===================//


//===================Getting the user stats===================
app.post('/mystats', function(req,res){

    console.log('app.post("/mystats")');
    console.log(req.body._id);
    user.getUserAccount(req.user._id,function(err,data){

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

    user.getUserAccount(req.user._id, function(err,data){

        if(data){
            console.log("Got data for account");
            res.writeHead(200,{"Content-Type":'application/json'});
            res.write(JSON.stringify(data));
            res.end();
        }
    });
});
//===================Getting the account form===================//

app.post('/changeNickname', function(req,res){
    
    console.log('app.post(/changeNickname');
    console.log('nickname: '+req.body.nickname);
    var nick=req.body.nickname;

    user.changeNickname(req.user._id, nick, function(err,data){
        if(data){
            res.redirect('/menu');
            req.user.nickname = nick
        }else{
            console.log('something went wrong');
        }
    });

    // res.writeHead(200,{'Content-Type':'text/javascript'});
    // res.end();
    // res.redirect('/myaccount');
});

app.get('/menu',function(req,res){
  if (req.user)
  {
    console.log("User: " +req.user +" loaded '/menu'")
    res.sendfile(__dirname + '/menu.html');
  }
  else
  {
    //TODO: Tell user to login
    res.redirect('/');
  }
})

//===================Parsing the account form===================
app.post('/changeAccount', function(req,res){
    
    console.log('app.post("/changeAccount"');
    console.log('nickname: '+req.body.nickname);
    var nick=req.body.nickname,
        oldpass=req.body.password,
        newpass=req.body.newPassword,
        confpass=req.body.confirmPassword;

    user.changeAccount(req.user._id, nick, oldpass, newpass, confpass, function(err,data){
        if(data){
            res.redirect('/menu');
        }else{
            console.log('something went wrong');
        }
    });

    // res.writeHead(200,{'Content-Type':'text/javascript'});
    // res.end();
    // res.redirect('/myaccount');
});
//===================Parsing the account form===================
