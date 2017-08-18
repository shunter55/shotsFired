"use strict"

// ServerPacket
class ServerPacket {
	constructor(type, playerArr, bulletArr, blockArr, flagArr, score) {
		this.type = type;
		this.playerArr = playerArr;
	   this.bulletArr = bulletArr;
	   this.blockArr = blockArr;
	   this.flagArr = flagArr;
	   this.score = score;
	}
}

module.exports = ServerPacket;