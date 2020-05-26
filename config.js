module.exports.config = {

	mqtt: {
		host: process.env.MQTT_HOST,
		username: process.env.MQTT_USERNAME,
		password: process.env.MQTT_PASSWORD,
		id: process.env.MQTT_ID,
		path: process.env.MQTT_PATH || 'unifi',
	},

	unifi: {
		host: process.env.UNIFI_HOST,
		port: process.env.UNIFI_PORT || 8443,
		username: process.env.UNIFI_USERNAME,
		password: process.env.UNIFI_PASSWORD,
		interval: process.env.UNIFI_INTERVAL || 1000,
	},

};
