var
http = require('http'),
path = require('path'),
fs = require('fs'),
swig = require('swig'),
socket = require('socket.io');

var tpl = swig.compileFile('/home/andrew/2-3T/templates/index.html');

var server = http.createServer(function(req, res) {
    var
    content = '',
    fileName = path.basename(req.url),
    pathName = path.dirname(req.url),
    localFolder = __dirname;
    
    // serve static files 
    if (path.dirname(pathName) == '/static') {
        content = localFolder + req.url;
        fs.readFile(content, function(err, contents) {
            if(!err) {
                // write proper header
                if (path.basename(pathName) == 'css')
                    res.writeHead(200, {'Content-Type': 'text/css'});
                else if (path.basename(pathName) == 'js')
                    res.writeHead(200, {'Content-Type': 'text/javascript'});
                // write contents 
                res.end(contents);
            } else {
                console.dir(err);
            }
        });
    // serve main page
    } else {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(tpl());
        res.end();
	}
});

var io = socket.listen(server);

io.on('connection', function(client) {
    console.log(io.sockets.clients());
    client.emit('new-game', {'connections': io.sockets.clients().length });
        
    client.on('disconnect', function(data) {
    });

    client.on('send-move', function(data) {
        console.log(data);
        client.broadcast.emit('push-move', data);
    });

});


server.listen(8080);
