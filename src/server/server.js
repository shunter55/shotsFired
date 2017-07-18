var PORT = 8080
var WIDTH = 600;
var HEIGHT = 600;

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
    // Accept the connection.
   var connection = r.accept('echo-protocol', r.origin);
   
   // Create event listener
   connection.on('message', function(message) {
      // Get the packet from the string sent to us.
      var packet = JSON.parse(message.utf8Data);
      
      // Update the connection's object.
      if (packet.up)
        connection.obj.moveUp();
      if (packet.down)
        connection.obj.moveDown();
      if (packet.left)
        connection.obj.moveLeft();
      if (packet.right)
        connection.obj.moveRight();

      connection.obj.tick();

      //// Loop through all clients and create array of all objects.
      //var objs = {};
      //for(var i in connections.clients) {
      //   var conn = connections.clients[i];
      //   objs[i] = JSON.stringify(conn.obj);
      //}
      //// Send objs to all clients.
      //for (var i in connections.clients) {
      //   var conn = connections.clients[i];
      //   // Send a message to the client with the message
      //   conn.send(JSON.stringify(objs));
      //}
   });

   connection.on('close', function(reasonCode, description) {
      delete connections.clients[id];
      console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
   });

   // Set the connection's id.
   var id = 0;
   for (var i in connections.clients) {
      var conn = connections.clients[i];
      if (conn.id == id)
         id = conn.id + 1;
   }
   connection.id = id;
   // Set the connection's object.
   var xPos = (id % 2) * (WIDTH * 0.8) + (WIDTH * 0.1);
   var yPos = (id % 2) * (HEIGHT * 0.8) + (HEIGHT * 0.1);
   connection.obj = new Object(xPos, yPos);

   // Add the connection to our list of connections.
   connections.clients[id] = connection;

   console.log((new Date()) + ' Connection accepted [' + id + ']');
});

var sendMessage = function() {
   // Loop through all clients and create array of all objects.
   var objs = {};
   for(var i in connections.clients) {
      var conn = connections.clients[i];
      objs[i] = JSON.stringify(conn.obj);
   }
   // Send objs to all clients.
   for (var i in connections.clients) {
      var conn = connections.clients[i];
      // Send a message to the client with the message
      conn.send(JSON.stringify(objs));
   }
}

setInterval(function() {
   sendMessage();
}, 10);
















var MAX_VELOCITY = 1;
var ACCELERATION = .01

function Object(x, y) {
   this.x = x;
   this.y = y;
   this.xVel = 0;
   this.yVel = 0;

   this.moveRight = function() {
      this.xVel = Math.min(this.xVel + ACCELERATION, MAX_VELOCITY);
   }

   this.moveLeft = function() {
      this.xVel = Math.max(this.xVel - ACCELERATION, -MAX_VELOCITY);
   }

   this.moveUp = function() {
      this.yVel = Math.max(this.yVel - ACCELERATION, -MAX_VELOCITY);
   }

   this.moveDown = function() {
      this.yVel = Math.min(this.yVel + ACCELERATION, MAX_VELOCITY);
   }

   this.tick = function() {
      this.x += this.xVel;
      this.y += this.yVel;

      this.xVel *= .99;
      this.yVel *= .99;
      if (this.xVel < 0.0095 && this.xVel > 0) {
         this.xVel = 0;
      } else if (this.xVel > -0.0095 && this.xVel < 0) {
         this.xVel = 0;
      }
      
      if (this.yVel < 0.0095 && this.yVel > 0) {
         this.yVel = 0;
      } else if (this.yVel > -0.0095 && this.yVel < 0) {
         this.yVel = 0;
      }
   }

   this.position = function() {
      console.log("(" + this.x + ", " + this.y + ")");
   }
};








