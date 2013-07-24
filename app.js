
/**
 * Module dependencies.
 */

var express = require('express')
  , partials = require('express-partials')
  , http = require('http')
  , path = require('path')
  , config = require('./config/config');

var app = express();

app.use(partials());

// all environments
app.set('port', config.server.port);
app.set('views', __dirname + '/app/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var appController = require('./app/controllers/app_controller').appController(app)
  , userController = require('./app/controllers/user_controller').userController(app);

app.get('/', appController.index);
app.get('/users', userController.index);

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var io = require('socket.io').listen(server);
io.sockets.on('connection', function(socket) {
    socket.broadcast.emit('enter', socket.id);

    socket.on('msg send', function(msg) {
        socket.emit('msg push', msg);
        socket.broadcast.emit('msg push', msg);
    });

    socket.on('disconnect', function() {
        socket.broadcast.emit('leave', socket.id);
    });
});