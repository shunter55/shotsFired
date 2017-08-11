"use strict"

// ServerPacket
class ServerPacket {
	constructor(playerArr, bulletArr, blockArr, flagArr) {
		this.playerArr = playerArr;
	   this.bulletArr = bulletArr;
	   this.blockArr = blockArr;
	   this.flagArr = flagArr;
	}
}

module.exports = ServerPacket;