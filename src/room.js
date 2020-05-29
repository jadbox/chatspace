function Room(info) {
  return {
    players: {},
				game: null,
				info,
				id: info.id,
				getLink: () => {
					if(!info.username) return 'room may not be public';
					return 'https://t.me/' + info.username;
				}
  };
}

const rooms = {
	add: (info) => {
		this.list = this.list || {};
		if(this.list[info.id]) return;

		this.list[info.id] = Room(info);
	},
	reset: (info) => {
		this.list[info.id] = Room(info);
	},
	resetAll: () => {
		this.list = {};
	},
	exists: (info) => {
		this.list = this.list || {};
		return !!this.list[info.id];
	},
	hasGame: (info)=> {
		this.list = this.list || {};
		return !!this.list[info.id] && !!this.list[info.id].game;
	},
	get: (info) => {
		this.list = this.list || {};
		this.list[info.id];
	},
	forEach: (cb) => {
		Object.values(this.list || {}).forEach(cb);
	}
}

module.exports = { Room, rooms };