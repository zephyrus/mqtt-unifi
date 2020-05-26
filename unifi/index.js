const { EventEmitter } = require('events');
const UnifiClient = require('node-unifi');
const { Site } = require('./site');

module.exports.Unifi = class UnifiController extends EventEmitter {

	constructor(config) {
		super();

		this.config = config;

		this.sites = [];

		this.controller = new UnifiClient.Controller(config.host, config.port);

		this.controller.login(config.username, config.password, (e) => {
			if (e) return this.emit('error', e);

			this.emit('connect');

			return this.fetch();
		});
	}

	site(data) {
		const site = new Site(this.controller, this.config, data);

		site.on('update', (client, state, diff) => {
			this.emit('update', site, client, state, diff);
		});

		this.sites.push(site);
	}

	fetch() {
		this.controller.getSitesStats((e, data) => {
			if (e) return this.emit('error', e);

			return data.forEach((site) => this.site(site));
		});
	}

};
