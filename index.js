// Don't Push the Button by Ezcha

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = 80;

var date = new Date();
var newDate = 0;

var seconds = 0;
var highscore = 0;
var users = 0;
var mostUsers = 0;
var pushCount = 0;
var counter = 0;

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
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
		if ((newDate - date)/1000 >= 1) {
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