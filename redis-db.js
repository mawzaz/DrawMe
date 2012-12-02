var redis = require('redis'),
    fs = require('fs'),
    client = redis.createClient(),
    node_guid = require('node-guid');

client.on("error", function (err) {
    console.log("Error " + err);
});

var _ = new Object();
module.exports = _;

_.put = function(room,data,cb){
  cb = cb || function(){};
  client.rpush(['room:drawing:'+room.guid,JSON.stringify(data)],cb);
};

_.getCurrentDrawing = function(room,cb){
  var key = 'room:drawing:'+room.guid;

  var pageItr = 0;
  var pageSize = 100;


  client.llen([key],function(err,length){
    var strokes=[];

    var max = length;
    var fetchPage = function (pItr,pSize){
      var start = pageItr*pSize;
      var end = (pageItr+1)*pSize -1;
      var stroke;

      client.lrange([key,start,end],function(err, data){
        //append the strokes
        for(var i in data){
          stroke = JSON.parse(data[i]);
          if(stroke && (stroke.type === 'end' || stroke.type === 'clear')){
            strokes.push(data[i]);
          }
        }

        if (pageItr*pSize + pSize >= max){
          cb(null,strokes);
        }else{
          pageItr++;
          process.nextTick(function(){
              fetchPage((pItr+1),pageSize);
          })
        }
      });
    };

    // now iterate over the list appending and joining as needed
    process.nextTick(function(){
        fetchPage(pageItr,pageSize);
    });
  });
};

_.flush = function(room,cb){
  var key = 'room:drawing:'+room.guid;
  cb = cb || function(){};

  this.getCurrentDrawing(room,function(err,strokes){
    if(strokes && strokes.length){

      var drawing = {
        guid:node_guid.new(),
        author:room.round.drawer,
        strokes:strokes,
        word:room.round.word,
        date: Date(),
        difficulty:1
      };

      fs.writeFile('./drawings/'+drawing.guid+'.json',JSON.stringify(drawing,null,2),function(err){
        if(err){
          console.err(err);
        }else{
          console.log('BACKED UP DRAWING ',drawing.guid);
        }
      });

      client.del([key],function(){});
    }
  })
};
