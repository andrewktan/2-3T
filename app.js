var
http = require('http'),
path = require('path'),
fs = require('fs'),
swig = require('swig'),
socket = require('socket.io'),
deleteKey = require('key-del');
gu = require('./gameutils.js');
su = require('./socketutils.js');

var domain = 'localhost:8080';  // change this

var room, ongoing = {}, emptyBoard = new Array(); // refactor

// route

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
    } else if (fileName == 'favicon.ico') {
    } else if (fileName == '' && pathName == '/'){  // serve intro page
        res.writeHead(200, {'Content-Type': 'text/html'});
        tpl = swig.compileFile('templates/index.html');
        res.write(tpl({
            'quickroom': gu.randomString(6), 
                'rooms': Object.keys(ongoing),
                'domain': domain
                }));

        res.end();
    } else if (pathName == '/') {    // serve board page
        room = fileName; // temporary
        res.writeHead(200, {'Content-Type': 'text/html'});
        tpl = swig.compileFile('templates/gameboard.html');
        res.write(tpl());
        res.end();
	} else {
        res.writeHead(404, {'Content-Type': 'text/html'});
        res.write(':(');
        res.end();
    }
});

// generate fresh board
for (i=0; i<9; i++) {
    emptyBoard[i] = new Array();
    for (j=0; j<9; j++)
        emptyBoard[i][j] = 'e';
}

// sockets
var io = socket.listen(server);

io.sockets.on('connection', su.onConnect(io, ongoing, room));


server.listen(8080);
