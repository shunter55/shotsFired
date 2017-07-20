var PORT = 8080
var WIDTH = 600;
var HEIGHT = 600;

var http = require('http');
var server = http.createServer(function(request, response) {});

var connections = {};
connections.count = 0;
connections.clients = {};
var bulletArr = [];
var blockArr = [];

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
            var bullet = new Bullet(playerObj.x, playerObj.y, 
                                    packet.shootPos.x, packet.shootPos.y);
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
   var position = util.getPosition(id);
   connection.obj = new Player(position.x, position.y, id);

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
      // IF player hits walls.
      else if (player.x < 0 || player.x > WIDTH - (2 * player.radius) || player.y < 0 || player.y > HEIGHT - (2 * player.radius)) {
         util.resetPlayerPosition(player);
         util.setPlayerDeathTimer(player);
      }
      // IF player collides with objects.
      else {
         // Bullet collision.
         for (var i in bulletArr) {
            var bullet = bulletArr[i];
            // IF player collides with bullet.
            if (util.collisionCC(player, bullet)) {
               util.resetPlayerPosition(player);
               util.setPlayerDeathTimer(player);
               bulletArr.splice(i, 1);
            }
         }
         // Block collision.
         for (var i in blockArr) {
            var block = blockArr[i];
            // IF player collides with block.
            if (util.collisionCR(player, block)) {
               util.resetPlayerPosition(player);
               util.setPlayerDeathTimer(player);
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
         if (util.collisionCR(bullet, block)) {
            bulletArr.splice(i, 1);
         }
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
}, 20);


var util = {};
util.getPlayerObjWithConnectionId = function(id) {

}
util.getPosition = function(id) {
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
   return {"x": xPos, "y": yPos};
}
util.resetPlayerPosition = function(player) {
   var position = util.getPosition(player.id);
   player.x = position.x;
   player.y = position.y;
   player.xVel = 0;
   player.yVel = 0;
}
util.setPlayerDeathTimer = function(player) {
   player.deathTimer = 25;
}
util.collisionCC = function(circle1, circle2) {
   var dist = Math.sqrt(Math.pow(circle1.x - circle2.x, 2) + Math.pow(circle1.y - circle2.y, 2));
   return dist <= circle1.radius + circle2.radius;
}
util.collisionCR = function(circle, rect) {
   var circleDist = {};
   circleDist.x = Math.abs(circle.x - rect.center.x);
   circleDist.y = Math.abs(circle.y - rect.center.y);

   if (circleDist.x > (rect.width / 2 + circle.radius)) { return false; }
   if (circleDist.y > (rect.height / 2 + circle.radius)) { return false; }

   if (circleDist.x <= (rect.width / 2)) { return true; } 
   if (circleDist.y <= (rect.height / 2)) { return true; }

   cornerDist_sq = Math.pow(circleDist.x - rect.width / 2, 2) +
                       Math.pow(circleDist.y - rect.height / 2, 2);

   return cornerDist_sq <= Math.pow(circle.radius, 2);
}









// ServerPacket
function ServerPacket(playerArr, bulletArr, blockArr) {
   this.playerArr = playerArr;
   this.bulletArr = bulletArr;
   this.blockArr = blockArr;
}



// Player - Circle
var MAX_VELOCITY = 10;
var ACCELERATION = .2;
var DECELERATION = .92;

function Player(x, y, id) {
   this.type = 'player';
   this.id = id;
   this.x = x;
   this.y = y;
   this.radius = 10;
   this.deathTimer = 0;
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

      if (this.deathTimer > 0)
         this.deathTimer--;
   }

   this.position = function() {
      console.log("(" + this.x + ", " + this.y + ")");
   }
};

// Bullet - Circle
var BULLET_VELOCITY = 10;
var BULLET_TIME_TO_LIVE = 75;
function Bullet(fromX, fromY, toX, toY) {
   this.type = 'bullet';
   this.radius = 5;
   var dist = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
   this.xVel = ((toX - fromX) / dist) * BULLET_VELOCITY;
   this.yVel = ((toY - fromY) / dist) * BULLET_VELOCITY;
   this.x = fromX + (2 * this.xVel);
   this.y = fromY + (2 * this.yVel);
   this.timeToLive = BULLET_TIME_TO_LIVE;

   this.tick = function() {
      this.x += this.xVel;
      this.y += this.yVel;
      this.timeToLive--;
   }
}

// Block - Rectangle
function Block(centerX, centerY, width, height) {
   this.center = {'x': centerX, 'y': centerY};
   this.width = width;
   this.height = height;
}



var setup = {};
setup.createMap = function() {
   var block1 = new Block(WIDTH / 2, HEIGHT / 2, 100, 50);
   blockArr.push(block1);
}

setup.createMap();





