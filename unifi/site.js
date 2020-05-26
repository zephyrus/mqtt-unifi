const { EventEmitter } = require('events');
const { Client } = require('./client');

module.exports.Site = class UnifiSite extends EventEmitter {

	constructor(controller, config, data) {
		super();

		this.clients = [];
		this.controller = controller;

		this.name = data.name;
		this.desc = data.desc;

		this.controller.getAllUsers(this.name, (e, result) => {
			if (e) return this.emit('error', e);

			result[0].forEach((client) => this.client(client));

			this.fetch();

			return setInterval(() => this.fetch(), config.interval);
		});
	}

	client(data) {
		const client = new Client(data);

		this.clients.push(client);

		this.emit('client', client);

		client.on('update', (state, diff) => {
			this.emit('update', client, state, diff);
		});

		return client;
	}

	find(id) {
		return this.clients.find((client) => client.id === id);
	}

	update(data) {
		// update existing clients, add new clients
		data.forEach((c) => {
			const client = this.find(c._id) || this.client(c);
			client.receive(c);
		});

		// offline
		this.clients
			.filter((client) => !data.find((i) => i._id === client.id))
			.forEach((client) => client.offline());
	}

	fetch() {
		this.controller.getClientDevices(this.name, (e, result) => {
			if (e) return this.emit('error', e);
			return this.update(result[0]);
		});
	}

};
