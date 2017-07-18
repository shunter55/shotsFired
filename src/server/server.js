var PORT = 8080

var http = require('http');
var server = http.createServer(function(request, response) {});

var connections = {};
connections.count = 0;
connections.clients = {};

server.listen(PORT, function() {
    console.log((new Date()) + ' Server is listening on port ' + PORT);
});

var WebSocketServer = require('websocket').server;
wsServer = new WebSocketServer({
    httpServer: server
});

wsServer.on('request', function(r){
    // Code here to run on connection
   var connection = r.accept('echo-protocol', r.origin);
   
   // Create event listener
   connection.on('message', function(message) {
      // The string message that was sent to us
      var msgString = message.utf8Data;

      // Loop through all clients
      for(var i in connections.clients) {
          // Send a message to the client with the message
          connections.clients[i].sendUTF(msgString);
      }
   });

   connection.on('close', function(reasonCode, description) {
       delete connections.clients[id];
      console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
   });

   // Specific id for this client & increment count
   var id = connections.count++;
   // Store the connection method so we can loop through & contact all clients
   connections.clients[id] = connection

   console.log((new Date()) + ' Connection accepted [' + id + ']');
});
