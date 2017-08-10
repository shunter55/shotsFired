
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
		WIDTH: 800,
		HEIGHT: 800,
		SCREEN_SIZE: 425 // (Client Width / 2) * sqrt(2)
	}
}

module.exports = Constants;