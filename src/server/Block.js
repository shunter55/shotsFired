const Constants = require("./Constants");
const Rectangle = require("./Rectangle");

class Block extends Rectangle {
	constructor(x, y, width, height) {
		super(x, y, width, height);
	}

	copy() {
		return new Block(this.center.x, this.center.y, this.width, this.height);
	}
}

module.exports = Block;