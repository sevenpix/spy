var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('public'));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function(socket) {
  socket.on('location', function(location) {
    io.emit('location', location);
    console.log('incoming "location" - Lat: ' + location.lat + ' Lon: ' + location.lon);
  });
});

var port = process.env.PORT || 3000;
http.listen(port, function() {
  console.log('listening on *:' + port);
});
