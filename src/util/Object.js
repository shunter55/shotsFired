var WIDTH = 600;
var HEIGHT = 600;
//var ACCELERATION = 1;
var MAX_VELOCITY = 1;
var ACCELERATION = .01
var PLAYER_SIZE = 50;

function Object(x, y) {
	this.x = x;
	this.y = y;
	this.xVel = 0;
	this.yVel = 0;
	this.size = PLAYER_SIZE;

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






