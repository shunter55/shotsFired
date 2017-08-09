const Constants = require("./Constants");
const ServerPacket = require('./ServerPacket');
const Player = require('./Player');
const Block = require('./Block');
const Bullet = require('./Bullet');
const Vertex = require('./Vertex');

var http = require('http');
var server = http.createServer(function(request, response) {});

var connections = {};
connections.count = 0;
connections.clients = {};
var bulletArr = [];
var blockArr = [];

server.listen(Constants.server.PORT, function() {
    console.log((new Date()) + ' Server is listening on port ' + Constants.server.PORT);
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
      var playerObj = this.obj;
      if (playerObj.deathTimer <= 0) {
         if (packet.up)
            playerObj.moveUp();
         if (packet.down)
            playerObj.moveDown();
         if (packet.left)
            playerObj.moveLeft();
         if (packet.right)
            playerObj.moveRight();
         playerObj.tick();

         // Shoot.
         if (packet.shoot) {
            var bullet = new Bullet(new Vertex(playerObj.center.x, playerObj.center.y), 
                                    new Vertex(packet.shootPos.x, packet.shootPos.y));
            bulletArr.push(bullet);
         }
      }
   });

   // Close the connection.
   connection.on('close', function(reasonCode, description) {
      delete connections.clients[this.id];
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
   connection.obj = new Player(id);

   // Add the connection to our list of connections.
   connections.clients[id] = connection;

   console.log((new Date()) + ' Connection accepted [' + id + ']');
});



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

   // Check Player hit.
   for (var j in playerArr) {
      var player = playerArr[j];

      // IF player death timer.
      if (player.deathTimer > 0) {
         player.deathTimer--;
      }
      // IF player goes out of bounds.
      else if (!player.inBounds()) {
         player.die();
      }
      // IF player collides with objects.
      else {
         // Bullet collision.
         for (var i in bulletArr) {
            var bullet = bulletArr[i];
            // IF player collides with bullet.
            if (player.collideCircle(bullet)) {
               player.die();
               bulletArr.splice(i--, 1);
            }
         }
         // Block collision.
         for (var i in blockArr) {
            var block = blockArr[i];
            // IF player collides with block.
            //if (util.collisionCR(player, block)) {
            if (player.collideRectangle(block)) {
               player.die();
            }
         }
      }
   };

   // Block collision.
   for (var i in blockArr) {
      var block = blockArr[i];
      for (var j in bulletArr) {
         var bullet = bulletArr[j];
         // Bullet hits block.
         if (bullet.collideRectangle(block)) {
            bulletArr.splice(j--, 1);
         }
      }
   }

   // Bullet collision.
   for (var i in bulletArr) {
      var bullet = bulletArr[i];
      if (!bullet.inBounds()) {
         bulletArr.splice(i--, 1);
      }
   }

   // Send ServerPacket to all clients.
   var packet = JSON.stringify(new ServerPacket(playerArr, bulletArr, blockArr));
   for (var i in connections.clients) {
      connections.clients[i].send(packet);
   };
}

// Send data to all clients.
setInterval(function() {
   // Send Object Coordinates to All Clients.
   updateClients();
}, 15);


var util = {};
util.getPlayerObjWithConnectionId = function(id) {

}


var setup = {};
setup.createMap = function() {
   var WIDTH = Constants.map.WIDTH;
   var HEIGHT = Constants.map.HEIGHT;

   var block1 = new Block(WIDTH / 2, HEIGHT / 2, 200, 25);
   var block2 = new Block(WIDTH / 2, HEIGHT / 4, 25, 100);
   var block3 = new Block(WIDTH / 2, 3 * HEIGHT / 4, 25, 100);
   blockArr.push(block1);
   blockArr.push(block2);
   blockArr.push(block3);
}

setup.createMap();





