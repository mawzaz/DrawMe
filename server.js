	var http = require('http'),
    faye = require('faye'),
    fs = require('fs'),
    sys = require('sys'),
    url=require('url'),
    path = require('path');
    
var mimeTypes = {
    "html": "text/html",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
    "js": "text/javascript",
    "css": "text/css"};

faye.Logging.logLevel = 'debug';

var bayeux = new faye.NodeAdapter({mount: '/faye', timeout: 45});

var handleRequest = function(req,res)
	{
		console.log("URL: "+req.url);
		var uri = url.parse(req.url).pathname;
		console.log("URI: "+uri);
		if(uri=="/")
			uri="./index.html";
    	var filename = path.join(process.cwd(), uri);
    	console.log("FILENAME: "+filename);
   	path.exists(filename, function(exists) 
   	{
        if(!exists) 
        {
            console.log("not exists: " + filename);
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.write('404 Not Found\n');
            res.end();
            return;
        }
        var mimeType = mimeTypes[path.extname(filename).split(".")[1]];
        res.writeHead(200, {"Content-Type":mimeType});

        var fileStream = fs.createReadStream(filename);
        fileStream.pipe(res);
		});
	};

var server = http.createServer(handleRequest);

bayeux.attach(server);
server.listen(8000);

bayeux.bind('subscribe', function(clientId, channel) {
  console.log('[ SUBSCRIBE] ' + clientId + ' -> ' + channel);
});

bayeux.bind('unsubscribe', function(clientId, channel) {
  console.log('[UNSUBSCRIBE] ' + clientId + ' -> ' + channel);
});

bayeux.bind('disconnect', function(clientId) {
  console.log('[ DISCONNECT] ' + clientId);
});