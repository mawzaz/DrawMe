	// var http = require('http'),
    // faye = require('faye'),
    // fs = require('fs'),
    // url=require('url'),
var io = require('socket.io'),
    express = require('express'),
    app = express(),
    server = require('http').createServer(app);

app.use(express.static(__dirname + '/'));
app.use('/images', express.static(__dirname + '/'));

io = io.listen(server);
server.listen(8000);

var rooms = {};

io.sockets.on('connection',function(socket){
    var channel = null;
    var room_nb = null;
    var player = null;

    socket.on('room_connect',function(data,cb){
        console.log('[SOMEONE IS JOINING ROOM #'+data.room+']');
        if(!rooms[data.room]){
            rooms[data.room] = {
                users:{},
                users_count:0
            }
        }


        player = data.player;
        room_nb = data.room;
        channel = 'room'+room_nb;

        socket.join(channel);
        
        var room = rooms[room_nb];

        //add user
        room.users[player.guid] = player;
        room.users_count++;

        //let everyone know about it
        broadcast({type:'user_add',player:player});
        cb({users:room.users});
    });

    socket.on('room_update',function(data,cb){
        broadcast(data);
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

        if(!room.users_count){
            delete rooms[room_nb]
        }

        broadcast({type:'user_remove',player:player.guid});
        socket.leave(channel);
    }

    var broadcast = function(data){
        socket.broadcast.to(channel).emit('on_room_update',data)
    }
});

