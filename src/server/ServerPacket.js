"use strict"

// ServerPacket
class ServerPacket {
	constructor(playerArr, bulletArr, blockArr, flagArr, score) {
		this.playerArr = playerArr;
	   this.bulletArr = bulletArr;
	   this.blockArr = blockArr;
	   this.flagArr = flagArr;
	   this.score = score;
	}
}

module.exports = ServerPacket;