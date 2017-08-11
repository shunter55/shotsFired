"use strict"

const Constants = require("./Constants");
const Circle = require('./Circle');

// positionFunction takes a flag and returns a vertex.
class Flag extends Circle {
	constructor(team, positionFunction) {
		super(0, 0, Constants.flag.RADIUS);
		this.team = team;
		this.positionFunction = positionFunction;
		this.resetPosition();
	}

	resetPosition() {
		var pos = this.positionFunction(this);
		this.center.x = pos.x;
		this.center.y = pos.y;
	}
}

module.exports = Flag;