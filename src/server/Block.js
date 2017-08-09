const Constants = require("./Constants");
const Rectangle = require("./Rectangle");

class Block extends Rectangle {
	constructor(x, y, width, height) {
		super(x, y, width, height);
	}
}

module.exports = Block;