var PORT = 8080;
var IP = 'localhost';
var ws = new WebSocket('ws://' + IP + ':' + PORT, 'echo-protocol');

var SWIDTH = 600;

var serverPacket;
var keys = { a: false, d: false, w: false, s: false, shoot: false, shootPos: { 'x': 0, 'y': 0 } };
var players = [];
var bullets = [];
var blocks = [];

window.addEventListener("keydown", function(event) {
  switch (event.key) {
    case 'a':
      keys.a = true;
      break;
    case 's':
      keys.s = true;
      break;
    case 'd':
      keys.d = true;
      break;
    case 'w':
      keys.w = true;
      break;
    }
});

window.addEventListener("keyup", function(event) {
  switch (event.key) {
    case 'a':
      keys.a = false;
      break;
    case 's':
      keys.s = false;
      break;
    case 'd':
      keys.d = false;
      break;
    case 'w':
      keys.w = false;
      break;
  }
});

var server = {};
server.connect = function() {
  if (ws != null) {
    ws.close();
  }
  var ip = document.getElementById("ip").value;
  alert(ip)
  ws = new WebSocket('ws://' + ip + ':' + PORT, 'echo-protocol');
  setupWS();
}

server.sendMessage = function() {
   var packet = new Packet();
   packet.left = keys.a;
   packet.right = keys.d;
   packet.up = keys.w;
   packet.down = keys.s;
   packet.shoot = keys.shoot;
   packet.shootPos = keys.shootPos;
   keys.shoot = false;
   ws.send(JSON.stringify(packet));
};


var setup = {};
setup.init = function() {
   var map = document.getElementById("map");
   map.addEventListener("click", player.shootBullet);
   map.style.width = window.innerHeight - 50;
   map.style.height = window.innerHeight - 50;
};

setup.setupWS = function() {
  ws.addEventListener("message", function(e) {
    serverPacket = JSON.parse(e.data);
    draw();
    server.sendMessage();
  });
};

setup.setupWS();


var player = {};
player.shootBullet = function(e) {
   var map = document.getElementById("map");
   map.style.width = window.innerHeight - 50;
   var offset = (window.innerWidth - map.style.width.substring(0, map.style.width.length-2))/2;
   var ratio = map.style.width.substring(0, map.style.width.length-2) / SWIDTH;
   keys.shoot = true
   keys.shootPos = {'x': (e.clientX - offset)/ratio, 'y': (e.clientY - 45)/ratio}
}

var util = {};
util.convertCenterPosCircle = function(circle, ratio) {
   console.log(circle)
   var pos = {};
   pos.x = circle.x - (ratio * circle.radius * 2) / 2;
   pos.y = circle.y - (ratio * circle.radius * 2) / 2;
   return pos;
}
util.convertCenterPosRectangle = function(rectangle, ratio) {
   var pos = {};
   pos.x = rectangle.center.x - (ratio * rectangle.width) / 2;
   pos.y = rectangle.center.y - (ratio * rectangle.height) / 2;
   return pos;
}


var draw = function() {
  var map = document.getElementById("map");
  map.style.width = window.innerHeight - 50;
  map.style.height = window.innerHeight - 50;
  var ratio = map.style.width.substring(0, map.style.width.length-2) / SWIDTH;
  var i = players.length;

  // Add Players.
  while (serverPacket.playerArr.length > players.length) {
    var player = document.createElement("div");
    player.style.width = (20 * ratio) + "px";
    player.style.height = (20 * ratio) + "px";
    player.style.backgroundColor = "green";
    player.style.borderRadius = (10 * ratio) + "px";
    player.style.position = "absolute";
    players.push(player);
    map.appendChild(player);
  }
  // Remove Players.
  while (serverPacket.playerArr.length < players.length) {
    map.removeChild(players[players.length - 1]);
    players.pop();
  }
  // Draw Players.
  for (var i in serverPacket.playerArr) {
    var player = serverPacket.playerArr[i];
    var pos = util.convertCenterPosCircle(player, ratio);
    players[i].style.top = pos.y;
    players[i].style.left = pos.x;
  }

  // Add Bullets.
  while (serverPacket.bulletArr.length > bullets.length) {
    var bullet = document.createElement("div");
    bullet.style.width = (10 * ratio) + "px";
    bullet.style.height = (10 * ratio) + "px";
    bullet.style.backgroundColor = "red";
    bullet.style.borderRadius = (5 * ratio) + "px";
    bullet.style.position = "absolute";
    bullets.push(bullet);
    map.appendChild(bullet);
  }
  // Remove Bullets.
  while (serverPacket.bulletArr.length < bullets.length) {
    map.removeChild(bullets[bullets.length - 1]);
    bullets.pop();
  }
  // Draw Bullets.
  for (var i in serverPacket.bulletArr) {
    var bullet = serverPacket.bulletArr[i];
    var pos = util.convertCenterPosCircle(bullet, ratio)
    bullets[i].style.top = pos.y;
    bullets[i].style.left = pos.x;
  }

  // Add Blocks.
  console.log(serverPacket.blockArr)
  while (serverPacket.blockArr.length > blocks.length) {
    var block = document.createElement("div");
    block.style.backgroundColor = "orange";
    block.style.position = "absolute";
    blocks.push(block);
    map.appendChild(block);
  }
  // Remove Blocks.
  while (serverPacket.blockArr.length < blocks.length) {
    map.removeChild(blocks[blocks.length - 1]);
    blocks.pop();
  }
  // Draw Blocks.
  for (var i in serverPacket.blockArr) {
    var block = serverPacket.blockArr[i];
    var pos = util.convertCenterPosRectangle(block, ratio);
    blocks[i].style.top = pos.y;
    blocks[i].style.left = pos.x;

    blocks[i].style.width = (block.width * ratio) + "px";
    blocks[i].style.height = (block.height * ratio) + "px";
  }
};












