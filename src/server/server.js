const Constants = require("./Constants");
const ServerPacket = require('./ServerPacket');
const Player = require('./Player');
const Block = require('./Block');
const Bullet = require('./Bullet');
const Flag = require('./Flag');
const Vertex = require('./Vertex');

var http = require('http');
var server = http.createServer(function(request, response) {});

var connections = {};
connections.count = 0;
// playerId : playerObj
connections.clients = {};
var bulletArr = [];
var blockArr = [];
// team : flagObj
var flagArr = {};
var score = {
   teams: [],
   time: 0
};

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
                                    new Vertex(packet.shootPos.x, packet.shootPos.y),
                                    playerObj.id);
            bulletArr.push(bullet);
         }
      }
   });

   // Close the connection.
   connection.on('close', function(reasonCode, description) {
      util.killPlayer(connections.clients[this.id].obj);
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
   connection.obj = new Player(id, setup.playerPositionFunction);

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
         util.killPlayer(player);
      }
      // IF player collides with objects.
      else {
         // Bullet collision.
         for (var i in bulletArr) {
            var bullet = bulletArr[i];
            // IF player collides with bullet.
            if (util.getPlayerWithId(bullet.shooterId).team != player.team && player.collideCircle(bullet)) {
               util.killPlayer(player);
               bulletArr.splice(i--, 1);
            }
         }
         // Block collision.
         for (var i in blockArr) {
            var block = blockArr[i];
            // IF player collides with block.
            if (player.collideRectangle(block)) {
               util.killPlayer(player);
            }
         }
         // Flag collision.
         for (var i in flagArr) {
            var flag = flagArr[i];
            // IF player collides with flag.
            if (player.collideCircle(flag)) {
               // Player touched own flag.
               if (player.team == flag.team) {
                  // Player has other teams flag.
                  if (player.flag != false && flag.atSpawn) {
                     score.teams[flag.team] += 1;
                     util.dropAndResetFlag(player);

                  }

                  flag.resetPosition();
               } else {
                  flag.pickUp();
                  player.flag = flag;
                  delete flagArr[i];
               }
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
   for (var id in connections.clients) {
      connections.clients[id].send(util.createPacketForId(id, playerArr, bulletArr, blockArr));
   };
}

// Send data to all clients.
setInterval(function() {
   // Send Object Coordinates to All Clients.
   updateClients();
}, 15);

// Game time
setInterval(function() {
   if (score.time <= 0) {
      start();
   }
   score.time -= 1;
}, 1000)


var util = {};
util.createPacketForId = function(playerId, playerArr, bulletArr, blockArr) {
   var player = connections.clients[playerId].obj;

   // Get players in range.
   var newPlayerArr = [];
   newPlayerArr.push(player);
   playerArr.forEach(function (obj) {
      if (obj.id != player.id && player.center.dist(obj.center) < Constants.map.SCREEN_SIZE) {
         newPlayerArr.push(obj);
      }
   });
   // Get bullets in range.
   var newBulletArr = [];
   bulletArr.forEach(function (obj) {
      if (player.center.dist(obj.center) < Constants.map.SCREEN_SIZE) {
         newBulletArr.push(obj);
      }
   });
   // Get blocks in range.
   var newBlockArr = [];
   blockArr.forEach(function (obj) {
      if (player.distRectangle(obj) < Constants.map.SCREEN_SIZE) {   
         newBlockArr.push(obj);
      }
   });
   // Get flags in range.
   var newFlagArr = [];
   for (var i in flagArr) {
      var obj = flagArr[i];
      if (player.center.dist(obj.center) < Constants.map.SCREEN_SIZE) {
         newFlagArr.push(obj);
      }
   }

   var packet = new ServerPacket(newPlayerArr, newBulletArr, newBlockArr, newFlagArr, score);
   return JSON.stringify(packet);
}

util.getPlayerWithId = function(id) {
   return connections.clients[id].obj;
}

util.dropAndResetFlag = function(player) {
   if (player.flag != false) {
      var flag = player.flag;
      flag.resetPosition();
      flagArr[flag.team] = flag;
      player.flag = false;
   }
}

util.killPlayer = function(player) {
   if (player.flag != false) {
      var flag = player.flag;
      flag.center.x = player.center.x;
      flag.center.y = player.center.y;
      flagArr[flag.team] = flag;
   }
   player.die();
}



var setup = {};
setup.createMap = function() {
   var WIDTH = Constants.map.WIDTH;
   var HEIGHT = Constants.map.HEIGHT;

   var wallBot = new Block(WIDTH / 2, HEIGHT, WIDTH + 25, 25);
   var wallTop = new Block(WIDTH / 2, 0, WIDTH + 25, 25);
   var wallLeft = new Block(0, HEIGHT / 2, 25, HEIGHT + 25);
   var wallRight = new Block(WIDTH, HEIGHT / 2, 25, HEIGHT + 25);
   blockArr.push(wallTop);
   blockArr.push(wallBot);
   blockArr.push(wallLeft);
   blockArr.push(wallRight);

   var block1 = new Block(WIDTH / 2, HEIGHT / 2, WIDTH * .4, 25);
   var block2 = new Block(WIDTH / 2, HEIGHT / 4, 25, WIDTH * .2);
   var block3 = new Block(WIDTH / 2, 3 * HEIGHT / 4, 25, WIDTH * .2);
   blockArr.push(block1);
   blockArr.push(block2);
   blockArr.push(block3);

   var flag0 = new Flag(0, setup.flagPositionFunction);
   var flag1 = new Flag(1, setup.flagPositionFunction);
   flagArr[0] = flag0;
   flagArr[1] = flag1;

   score.teams.push(0);
   score.teams.push(0);

   score.time = 300;
}

setup.playerPositionFunction = function(player) {
   var changeX = Constants.map.WIDTH * 0.15;
   var changeY = Constants.map.HEIGHT * 0.15;

   if (player.team == 1) {
      var xPos = Constants.map.WIDTH * 0.95 - random(0, changeX);
      var yPos = Constants.map.HEIGHT * 0.95 - random(0, changeY);
      return new Vertex(xPos, yPos)
   }

   var xPos = Constants.map.WIDTH * 0.05 + random(0, changeX);
   var yPos = Constants.map.HEIGHT * 0.05 + random(0, changeY);
   return new Vertex(xPos, yPos)
}

setup.flagPositionFunction = function(flag) {
   if (flag.team == 1) {
      return new Vertex(Constants.map.WIDTH * 0.9, Constants.map.HEIGHT * 0.9);
   }
   return new Vertex(Constants.map.WIDTH * 0.1, Constants.map.HEIGHT * 0.1);
}

var random = function(start, end) {
   return Math.floor(Math.random() * (end - start + 1)) + start
}

var start = function() {
   for (var i in connections.clients) {
      var player = connections.clients[i].obj;
      util.killPlayer(player);
   }

   for (var i in flagArr) {
      var flag = flagArr[i];
      flag.resetPosition;
   }

   bulletArr = [];

   score = {
      teams: [],
      time: 0
   };

   setup.createMap();
}

start();





