const Constants = require("./Constants");
const Circle = require('./Circle');
const Vertex = require('./Vertex');


var MAX_VELOCITY = Constants.player.MAX_VELOCITY;
var ACCELERATION = Constants.player.ACCELERATION;
var DECELERATION = Constants.player.DECELERATION;
var RADIUS = Constants.player.RADIUS;

class Player extends Circle {
	constructor(id) {
		super(0, 0, RADIUS);
		this.resetPosition();

		this.type = 'player';
   	this.id = id;
   	this.deathTimer = 0;
	   this.xVel = 0;
	   this.yVel = 0;
	}

	moveRight() {
      this.xVel = Math.min(this.xVel + ACCELERATION, MAX_VELOCITY);
   }

   moveLeft() {
      this.xVel = Math.max(this.xVel - ACCELERATION, -MAX_VELOCITY);
   }

   moveUp() {
      this.yVel = Math.max(this.yVel - ACCELERATION, -MAX_VELOCITY);
   }

   moveDown() {
      this.yVel = Math.min(this.yVel + ACCELERATION, MAX_VELOCITY);
   }

   die() {
      this.resetPosition();
      this.setDeathTimer();
   }

   resetPosition() {
   	var position = getPosition(this.id);
	   this.center.x = position.x;
	   this.center.y = position.y;
	   this.xVel = 0;
	   this.yVel = 0;
   }

   setDeathTimer() {
   	this.deathTimer = Constants.player.DEATH_TIME;
   }

   tick() {
      this.center.x += this.xVel;
      this.center.y += this.yVel;

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

   copy() {
   	var newPlayer = new Player(this.center.x, this.center.y, this.id);
   	newPlayer.deathTimer = this.deathTimer;
   	newPlayer.xVel = this.xVel;
   	newPlayer.yVel = this.yVel;
   	return newPlayer;
   }

   position() {
      console.log("(" + this.x + ", " + this.y + ")");
   }
}

var getPosition = function(id) {
   var xPos, yPos;
   if (id === 0) {
      xPos = Constants.map.WIDTH * 0.1;
      yPos = Constants.map.HEIGHT * 0.1;
   } else if (id === 1) {
      xPos = Constants.map.WIDTH * 0.9;
      yPos = Constants.map.HEIGHT * 0.9;
   } else if (id === 2) {
      xPos = Constants.map.WIDTH * 0.9;
      yPos = Constants.map.HEIGHT * 0.1;
   } else if (id == 3) {
      xPos = Constants.map.WIDTH * 0.1;
      yPos = Constants.map.HEIGHT * 0.9;
   } else {
      xPos = Constants.map.WIDTH / 2;
      yPos = Constants.map.HEIGHT / 2;
   }
   return new Vertex(xPos, yPos);
}

module.exports = Player;










