const { connect } = require('mqtt');
const { Unifi } = require('./unifi');
const { config } = require('./config');
const { version } = require('./package');

const topics = {
	state: () => `${config.mqtt.path}/state`,
	update: ({ siteDescription, name }) => `${config.mqtt.path}/${siteDescription}/${name}`,
};

const format = (type, args) => [
	(new Date()).toISOString().substring(0, 10),
	(new Date()).toTimeString().substring(0, 8),
	`[${type.toUpperCase()}]`,
	...args,
].join(' ');

const log = (type, ...args) => console.log(format(type, args));

const error = (type, ...args) => console.error(format(type, args));

const mqtt = connect(config.mqtt.host, {
	username: config.mqtt.username,
	password: config.mqtt.password,
	clientId: config.mqtt.id,
	will: {
		topic: topics.state(),
		payload: JSON.stringify({ online: false }),
		retain: true,
	},
});

const unifi = new Unifi(config.unifi);

unifi.on('error', (e) => {
	error('unifi', 'connection error');
	error('unifi', `  > ${e.toString()}`);

	// exiting in case of error so
	// supervisor can restart it
	process.exit(1);
});

unifi.on('connect', () => {
	error('unifi', `connected to ${config.unifi.host}`);

	mqtt.publish(topics.state(), JSON.stringify({
		online: true,
		version,
	}), { retain: true });
});

unifi.on('update', (site, client, state) => {
	const topic = topics.update({
		siteName: site.name,
		siteDescription: site.desc,
		name: client.name,
		mac: client.mac,
	});

	log('unifi', `update for ${topic}`);
	log('unifi', `  > ${JSON.stringify(state)}`);

	mqtt.publish(topic, JSON.stringify(state), {
		retain: true,
	});
});

mqtt.on('connect', () => log('mqtt', `connected to ${config.mqtt.host}`));

mqtt.on('error', (e) => {
	error('mqtt', 'connection error');
	error('mqtt', `  > ${e.toString()}`);

	// exiting in case of error so
	// supervisor can restart it
	process.exit(1);
});
