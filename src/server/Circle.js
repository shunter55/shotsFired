const Constants = require("./Constants");
const Vertex = require("./Vertex");

class Circle {
	constructor(x, y, radius) {
		this.center = new Vertex(x, y);
		this.radius = radius;
	}

	collideCircle(other) {
   	return this.center.dist(other.center) <= this.radius + other.radius;
	}

	collideRectangle(other) {
		var circleDist = {};
	   circleDist.x = Math.abs(this.center.x - other.center.x);
	   circleDist.y = Math.abs(this.center.y - other.center.y);

	   if (circleDist.x > (other.width / 2 + this.radius)) { return false; }
	   if (circleDist.y > (other.height / 2 + this.radius)) { return false; }

	   if (circleDist.x <= (other.width / 2)) { return true; } 
	   if (circleDist.y <= (other.height / 2)) { return true; }

	   var cornerDist_sq = Math.pow(circleDist.x - other.width / 2, 2) +
	                       Math.pow(circleDist.y - other.height / 2, 2);

	   return cornerDist_sq <= Math.pow(this.radius, 2);
	}

	inBounds() {
		return !(this.center.x < 0 + this.radius ||
					this.center.x > Constants.map.WIDTH - this.radius ||
					this.center.y < 0 + this.radius || 
					this.center.y > Constants.map.HEIGHT - this.radius);
	}
}

module.exports = Circle;





