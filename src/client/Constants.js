
var Constants = {
	server: {
		PORT: 8080
	},
	player: {
		MAX_VELOCITY: 12,
		ACCELERATION: .21,
		DECELERATION: .92,
		RADIUS: 10,
		DEATH_TIME: 25
	},
	bullet: {
		RADIUS: 5,
		VELOCITY: 10,
		TIME_TO_LIVE: 75
	},
	map: {
		WIDTH: 600,
		HEIGHT: 600,
		SCREEN_SIZE: 600
	}
}

module.exports = Constants;