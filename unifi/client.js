const { EventEmitter } = require('events');

module.exports.Client = class UnifiClient extends EventEmitter {

	constructor(data) {
		super();

		this.id = data._id;
		this.mac = data.mac;
		this.name = data.name || data.hostname;

		this.state = {};
	}

	update(data) {
		const diff = {};

		Object.keys(data).forEach((key) => {
			if (this.state[key] === data[key]) return;

			diff[key] = data[key];
			this.state[key] = data[key];
		});

		if (Object.keys(diff).length > 0) {
			this.emit('update', this.state, diff);
		}
	}

	parse(data) {
		return {
			online: true,
			mac: data.mac,
		};
	}

	receive(data) {
		this.update(this.parse(data));
	}

	offline() {
		this.update({ online: false });
	}

};
