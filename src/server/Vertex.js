"use strict"

class Vertex {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	dist(other) {
		return Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2));
	}
}

module.exports = Vertex;