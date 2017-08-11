"use strict"

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

	distRectangle(other) {
		if (this.center.x < other.xMin) { // Region I, VIII, or VII
            if (this.center.y < other.yMin) { // I
                var diff = new Vertex(other.xMin, other.yMin);
                return this.center.dist(diff);
            }
            else if (this.center.y > other.yMax) { // VII
                var diff = new Vertex(other.xMin, other.yMax);
                return this.center.dist(diff);
            }
            else { // VIII
                return other.xMin - this.center.x;
            }
        }
        else if (this.center.x > other.xMax) { // Region III, IV, or V
            if (this.center.y < other.yMin) { // III
                var diff = new Vertex(other.xMax, other.yMin);
                return this.center.dist(diff);
            }
            else if (this.center.y > other.yMax) { // V
                var diff = new Vertex(other.xMax, other.yMax);
                return this.center.dist(diff);
            }
            else { // IV
                return this.center.x - other.xMax;
            }
        }
        else { // Region II, IX, or VI
            if (this.center.y < other.yMin) { // II
                return other.yMin - this.center.y;
            }
            else if (this.center.y > other.yMax) { // VI
                return this.center.y - other.yMax;
            }
            else { // IX
                return 0;
            }
        }
	}

	inBounds() {
		return !(this.center.x < 0 + this.radius ||
					this.center.x > Constants.map.WIDTH - this.radius ||
					this.center.y < 0 + this.radius || 
					this.center.y > Constants.map.HEIGHT - this.radius);
	}
}

module.exports = Circle;





