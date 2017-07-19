var PORT = 8080
var WIDTH = 600;
var HEIGHT = 600;

var http = require('http');
var server = http.createServer(function(request, response) {});

var connections = {};
connections.count = 0;
connections.clients = {};
var bulletArr = [];

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
   
   // Update the connection's Object on message.
   connection.on('message', function(message) {
      // Get the packet from the string sent to us.
      var packet = JSON.parse(message.utf8Data);
      
      // Update the connection's Player object.
      if (packet.up)
        connection.obj.moveUp();
      if (packet.down)
        connection.obj.moveDown();
      if (packet.left)
        connection.obj.moveLeft();
      if (packet.right)
        connection.obj.moveRight();
      connection.obj.tick();

      // Shoot.
      if (packet.shoot) {
         var bullet = new Bullet(connection.obj.x, connection.obj.y, 
                                 packet.shootPos.x, packet.shootPos.y);
         bulletArr.push(bullet);
      }
   });

   // Close the connection.
   connection.on('close', function(reasonCode, description) {
      delete connections.clients[id];
      console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
   });

   // SETUP CONNECTION.
   // Set the connection's id.
   var id = 0;
   for (var i in connections.clients) {
      var conn = connections.clients[i];
      if (conn.id == id)
         id = conn.id + 1;
   }
   connection.id = id;
   // Set the connection's object.
   var position = getPosition(id);
   connection.obj = new Player(position.xPos, position.yPos);

   // Add the connection to our list of connections.
   connections.clients[id] = connection;

   console.log((new Date()) + ' Connection accepted [' + id + ']');
});

var getPosition = function(id) {
   var xPos, yPos;
   if (id === 0) {
      xPos = WIDTH * 0.1;
      yPos = HEIGHT * 0.1;
   } else if (id === 1) {
      xPos = WIDTH * 0.9;
      yPos = HEIGHT * 0.9;
   } else if (id === 2) {
      xPos = WIDTH * 0.9;
      yPos = HEIGHT * 0.1;
   } else if (id == 3) {
      xPos = WIDTH * 0.1;
      yPos = HEIGHT * 0.9;
   } else {
      xPos = WIDTH / 2;
      yPos = HEIGHT / 2;
   }

   return {"xPos": xPos, "yPos": yPos};
}

// Sends data to all clients.
var updateClients = function() {
   // Get all player objects.
   var playerArr = [];
   for (var i in connections.clients) {
      var conn = connections.clients[i];
      playerArr.push(conn.obj);
   };

   // Update Bullet objects.
   bulletArr.map(function(bullet) {
      bullet.tick();
   });
   bulletArr = bulletArr.filter(bullet => bullet.timeToLive > 0);

   // Send ServerPacket to all clients.
   var packet = JSON.stringify(new ServerPacket(playerArr, bulletArr));
   for (var i in connections.clients) {
      var conn = connections.clients[i];
      conn.send(packet);
   };
}

// Send data to all clients.
setInterval(function() {
   // Send Object Coordinates to All Clients.
   updateClients();
}, 20);












// ServerPacket
function ServerPacket(playerArr, bulletArr) {
   this.playerArr = playerArr;
   this.bulletArr = bulletArr;
}



// Player
var MAX_VELOCITY = 5;
var ACCELERATION = .17;
var DECELERATION = .92;

function Player(x, y) {
   this.type = 'player';
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

      this.xVel *= DECELERATION;
      this.yVel *= DECELERATION;
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

// Bullet
var BULLET_VELOCITY = 10;
var BULLET_TIME_TO_LIVE = 75;
function Bullet(fromX, fromY, toX, toY) {
   this.type = 'bullet';
   this.x = fromX;
   this.y = fromY;
   var dist = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
   this.xVel = ((toX - fromX) / dist) * BULLET_VELOCITY;
   this.yVel = ((toY - fromY) / dist) * BULLET_VELOCITY;
   this.timeToLive = BULLET_TIME_TO_LIVE;

   this.tick = function() {
      this.x += this.xVel;
      this.y += this.yVel;
      this.timeToLive--;
   }
}








