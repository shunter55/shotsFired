var PORT = 8080;
var IP = 'localhost';
var ws = new WebSocket('ws://' + IP + ':' + PORT, 'echo-protocol');

var SWIDTH = 600;

var serverPacket;
var keys = { a: false, d: false, w: false, s: false, shoot: false, shootPos: { 'x': 0, 'y': 0 } };
var players = [];
var bullets = [];

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

var connect = function() {
  if (ws != null) {
    ws.close();
  }
  var ip = document.getElementById("ip").value || "localhost";
  ws = new WebSocket('ws://' + ip + ':' + PORT, 'echo-protocol');
  setupWS();
}

function init() {
  var map = document.getElementById("map");
  map.addEventListener("click", shootBullet);
  map.style.width = window.innerHeight - 50;
  map.style.height = window.innerHeight - 50;
}

function shootBullet(e) {
  var map = document.getElementById("map");
  map.style.width = window.innerHeight - 50;
  var offset = (window.innerWidth - map.style.width.substring(0, map.style.width.length-2))/2;
  var ratio = map.style.width.substring(0, map.style.width.length-2) / SWIDTH;
  keys.shoot = true
  keys.shootPos = {'x': (e.clientX - offset)/ratio, 'y': (e.clientY - 45)/ratio}
}

var setupWS = function() {
  ws.addEventListener("message", function(e) {
    serverPacket = JSON.parse(e.data);
    draw();
    sendMessage();
  });
};

var sendMessage = function() {
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

setupWS();

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
    players[i].style.top = serverPacket.playerArr[i].y * ratio;
    players[i].style.left = serverPacket.playerArr[i].x * ratio;
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
    bullets[i].style.top = serverPacket.bulletArr[i].y * ratio;
    bullets[i].style.left = serverPacket.bulletArr[i].x * ratio;
  }
};


