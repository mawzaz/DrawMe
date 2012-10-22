var io = require('socket.io'),
    express = require('express'),
    app = express(),
    server = require('http').createServer(app);

app.use(express.static(__dirname + '/'));
app.use('/images', express.static(__dirname + '/'));

io = io.listen(server);
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
        console.log('[SOMEONE IS JOINING ROOM #'+data.room+']');

        player = data.player;
        room_nb = data.room;
        channel = 'room'+room_nb;

        socket.join(channel);
        var room = rooms[room_nb];
        
        if(!room){
            room = rooms[data.room] = {
                users:{},
                users_count:0,
                current_word:'',
                drawer_queue:[],
                round:{timer:0,nb:0,clock:null,drawer:null}
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
        cb({users:room.users,round:{nb:room.round.nb, time:room.round.timer, drawer:room.round.drawer}});
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

    socket.on('disconnect',function(){
        leaveRoom();
    });

    var leaveRoom = function(){
        var room = rooms[room_nb];

        delete room.users[player.guid];
        room.users_count--;

        //remove user from drawer queue (if still present)
        for(var i in room.drawer_queue){
            if(!room.drawer_queue[i])
                break;
            if (room.drawer_queue[i].guid === player.guid)
                room.drawer_queue[i] = null;
        }

        if(room.users_count <= 0){
            delete rooms[room_nb];
        }else if(room.users_count === 1){
            stopRound(room);
        }

        broadcast({type:'user_remove',player:player.guid});
        socket.leave(channel);
    }

    var broadcast = function(data){
        io.sockets.to(channel).emit('on_room_update',data)
    }

    var startRound = function(room){
        room.round.timer = MAX_TIME/1000;
        room.round.drawer = room.drawer_queue.shift();
        room.round.word = WORDS[Math.floor(Math.random()*WORDS.length)];

        broadcast({type:'round_start',round:{nb:++room.round.nb, time:room.round.timer, drawer:room.round.drawer ? room.round.drawer.guid : null, word:room.round.word}});

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
            stopRound(room);
        },MAX_TIME)
    }

    var stopRound = function(room){
        room.round.timer = 0;

        //reset clock
        clearInterval(room.round.clock);
        clearTimeout(room.round.stop);

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

        if(msg.chat.value.toLowerCase() === room.round.word){
            stopRound(room);
            broadcast({type:'results', winner:msg.chat.user});
        }

        broadcast(msg);
    }

});

