const Constants = require("./Constants");
const Vertex = require("./Vertex");

class Rectangle {
	constructor(x, y, width, height) {
		this.center = new Vertex(x, y);
		this.width = width;
		this.height = height;
	}

	get xMin() {
		return this.center.x - this.width / 2;
	}

	get yMin() {
		return this.center.y - this.height / 2;
	}

	get xMax() {
		return this.center.x + this.width / 2;
	}

	get yMax() {
		return this.center.y + this.height / 2;
	}

	collide(circle) {
		circle.collide(this);
	}
}

module.exports = Rectangle;