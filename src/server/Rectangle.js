const Constants = require("./Constants");
const Vertex = require("./Vertex");

class Rectangle {
	constructor(x, y, width, height) {
		this.center = new Vertex(x, y);
		this.width = width;
		this.height = height;
	}

	collide(circle) {
		circle.collide(this);
	}
}

module.exports = Rectangle;