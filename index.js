// Don't Push the Button by Ezcha

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var date = new Date();
var newDate = 0;

var seconds = 0;
var highscore = 0;
var users = 0;
var mostUsers = 0;
var pushCount = 0;
var counter = 0;

/* Poorly Made 'Config' */
var port = 80; //The port the server runs on. (80 is the default)
var spamProtection = 1; //Seconds between button clicks. Set to -1 to disable.
var maxUsers = 100; //Maximum amount of connections the server will allow. Set to -1 to disable.
/* ok that's all */

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

app.get('/blocked', function(req, res){
	res.sendFile(__dirname + '/blocked.html');
});

http.listen(port, function(){
	console.log('listening on *: '+port.toString());
});

io.on('connection', function(socket) {
	users += 1;
	if (mostUsers < users) {
		mostUsers = users;
		io.emit('mostUsers', users);
	}
	if (users > maxUsers && maxUsers != -1) {
		setTimeout(function() {
			socket.emit("block");
			if (socket != null) {
				socket.disconnect();
			}
		},100);
	}
	io.emit('time', seconds);
	io.emit('highscore', highscore);
	io.emit('users', users);
	io.emit('mostUsers', mostUsers);
	io.emit('pushCount', pushCount);
	console.log('User connected. '+users.toString()+" users connected.");
	socket.on('disconnect', function() {
		users -= 1;
		io.emit('users', users);
		console.log('User disconnected. '+users.toString()+" users connected.");
	});
	socket.on('push', function() {
		//Spam protection?
		//Use socket.id
		newDate = new Date();
		if ((newDate - date)/1000 >= spamProtection) {
			console.log('Button has been pushed.');
			date = new Date();
			seconds = 0;
			pushCount += 1;
			io.emit('time', seconds);
			io.emit('pushCount', pushCount);
			io.emit('push');
			clearInterval(counter);
			counter = setInterval(function() {
				seconds += 1;
				io.emit('time', seconds);
				if (seconds > highscore) {
					highscore = seconds;
					io.emit('highscore', highscore);
				}
			},1000);
		}
	});
});

counter = setInterval(function() {
	seconds += 1;
	io.emit('time', seconds);
	if (seconds > highscore) {
		highscore = seconds;
		io.emit('highscore', highscore);
	}
},1000);