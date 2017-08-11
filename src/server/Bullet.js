"use strict"

const Constants = require("./Constants");
const Circle = require('./Circle');

class Bullet extends Circle {
	constructor(from, to, shooterId) {
		super(from.x, from.y, Constants.bullet.RADIUS);

      this.shooterId = shooterId;
		var dist = from.dist(to);
		this.xVel = ((to.x - from.x) / dist) * Constants.bullet.VELOCITY;
	   this.yVel = ((to.y - from.y) / dist) * Constants.bullet.VELOCITY;
	   this.center.x = from.x + (2 * this.xVel);
	   this.center.y = from.y + (2 * this.yVel);
	   this.timeToLive = Constants.bullet.TIME_TO_LIVE;
	}

	tick() {
      this.center.x += this.xVel;
      this.center.y += this.yVel;
      this.timeToLive--;
   }

   copy() {
   	var newBullet = new Bullet(this.center, this.center);
   	newBullet.center.x = this.center.x;
   	newBullet.center.y = this.center.y;
   	newBullet.xVel = this.xVel;
   	newBullet.yVel = this.yVel;
   	newBullet.timeToLive = this.timeToLive;
   }
}

module.exports = Bullet;