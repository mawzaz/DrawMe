var io = require('socket.io'),
    express = require('express'),
    app = express(),
    server = require('http').createServer(app)
    redis_db = require('./redis-db.js');
    node_guid = require('node-guid');
    mysql      = require('./mysql-db.js');


app.use(express.static(__dirname + '/'));
app.use('/images', express.static(__dirname + '/'));
app.use(express.bodyParser());

//-----Maurice Stuff

app.post('/login', function(req,res){

    var nickName = req.body.nickName,
        password = req.body.password;
    
    //console.log(JSON.stringify(req.body));
    mysql.connect('localhost','root','');
    
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

    mysql.connect('localhost','root','');
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
})
//------------------------------END OF Maurice

io = io.listen(server,{ log: false });
server.listen(8000);

var rooms = {};

var MAX_TIME = 90000; //1 min 30 sec
// var MAX_TIME = 5000;

var WORDS = ['dog','cat','ball','couch','horse','house','money','human','bird'];

io.sockets.on('connection',function(socket){
    var channel = null;
    var room_nb = null;
    var player = null;

    socket.on('room_connect',function(data,cb){
        console.log('['+data.player.name+' IS JOINING ROOM #'+data.room+']');

        player = data.player;
        room_nb = data.room;
        channel = 'room'+room_nb;

        socket.join(channel);
        var room = rooms[room_nb];
        
        if(!room){
            room = rooms[data.room] = {
                guid:node_guid.new(),
                users:{},
                users_count:0,
                drawer_queue:[],
                round:{timer:0,nb:0,clock:null,drawer:null,word:null}
            }
        }else if(rooms[data.room].users_count === 1){
          startRound(room);
        }

        //add user
        room.users[player.guid] = player;
        room.users_count++;

        room.drawer_queue.push(player); //push player onto drawer stack

        //let everyone know about it
        broadcast({type:'user_add',player:player});

        redis_db.getCurrentDrawing(room,function(err,strokes){
            cb({users:room.users,round:{nb:room.round.nb, time:room.round.timer, drawer:room.round.drawer ? room.round.drawer.guid : null, drawing:strokes}});
        });
    });

    socket.on('room_update',function(data,cb){
        switch(data.type){
            case 'chat':
                //process guess
                processGuess(data);
                break;
            default:
                broadcast(data);    
        }
        if(cb)
            cb(data);
    });

    socket.on('drawing',function(data){
        redis_db.put(rooms[room_nb],data);
        socket.broadcast.to(channel).emit('drawing',data);
    });

    socket.on('disconnect',function(){
        leaveRoom();
    });

    var leaveRoom = function(){
        console.log('['+player.name+' IS LEAVING ROOM #'+room_nb+']');

        broadcast({type:'user_remove',player:player.guid});
        
        var room = rooms[room_nb];

        delete room.users[player.guid];
        room.users_count--;

        //remove user from drawer queue (if still present)
        for(var i in room.drawer_queue){
            if (room.drawer_queue[i].guid === player.guid)
                room.drawer_queue.splice(i,1);
        }

        if(room.users_count <= 0){
            delete rooms[room_nb];
        }else if(room.users_count === 1 || room.round.drawer.guid === player.guid){
            redis_db.flush(room,true);

            stopRound(room);

            if(!room.drawer_queue.length){
                for(var i in room.users){
                    room.drawer_queue.push(room.users[i]);
                }
            }
        }

        socket.leave(channel);
    }

    var broadcast = function(data){
        io.sockets.to(channel).emit('on_room_update',data);
    }

    var startRound = function(room){
        room.round.drawer = room.drawer_queue.shift();

        var round = {drawer:room.round.drawer ? room.round.drawer.guid : null, nb:++room.round.nb};
        broadcast({type:'pre_round_start', round:round});

        var countdown = 5;
        room.round.delayInterval = setInterval(function(){
            if(countdown > 0){
                round.time = countdown;
                broadcast({type:'pre_round_countdown', round:round})
                countdown--;
                return;
            }

            clearInterval(room.round.delayInterval);

            room.round.timer = MAX_TIME/1000;
            room.round.word = WORDS[Math.floor(Math.random()*WORDS.length)];

            broadcast({type:'round_start',round:{nb:room.round.nb, time:room.round.timer, drawer:room.round.drawer ? room.round.drawer.guid : null, word:room.round.word}});

            room.round.clock = setInterval(function(){
                if(room.round.timer < 0){
                    clearInterval(room.round.clock);
                    return;
                }
                try{
                    room.round.timer--;
                    if(room.round.timer < 1){
                        room.round.time = 0;
                        clearInterval(room.round.clock);
                    }
                    broadcast({type:'clock',round:{nb:room.round.nb, time:room.round.timer, drawer:room.round.drawer.guid}});
                }catch(e){
                    clearInterval(room.round.clock);
                }
            },1000); //decrease countdown

            //reset timer when done
            room.round.stop = setTimeout(function(){
                broadcast({type:'results', winner:null, word:room.round.word});
                redis_db.flush(room);
                stopRound(room);
            },MAX_TIME)
        },1000);
    }

    var stopRound = function(room){
        room.round.timer = 0;

        //reset clock
        clearInterval(room.round.clock);
        clearTimeout(room.round.stop);
        clearTimeout(room.round.delayInterval);

        broadcast({type:'round_end',round:{nb:room.round.nb, time:room.round.timer, drawer:room.round.drawer.guid}});

        if(room.users_count > 1){
            var current_drawer = room.round.drawer;
            if(room.users[current_drawer.guid])
                room.drawer_queue.push(current_drawer);
            startRound(room);
        }
        else{
            room.round.nb = 0;
            room.round.clock = null;
            broadcast({type:'idle', round:{nb:room.round.nb, time:room.round.timer, drawer:room.round.drawer.guid}});
        }
    }

    var processGuess = function(msg){
        var room = rooms[room_nb];
        broadcast(msg);

        if(msg.chat.value.toLowerCase() === room.round.word){
            redis_db.flush(room);

            broadcast({type:'results', winner:msg.chat.user, word:room.round.word});
            stopRound(room);
        }
    }

});

