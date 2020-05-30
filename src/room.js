function Room(info) {
  return {
				players: {},
				rooms: {},
				welcomeMsg: {},
				game: null,
				info: info,
				id: info.id,
				name: info.username,
				private: info.type === 'private',
				getLink() {
					if(!info.username) return 'room may not be public';
					return 'https://t.me/' + info.username;
				}
  };
}

class Rooms {
	constructor() {
		this.list = {};
		this.players = {};
	}
	setPlayer(info, playerObj) {
		const id = playerObj.username;

		let player = this.players[id]
		if(!!player) {
				const lroom = player.room;
				// delete from last room
					if(this.exists(lroom)) delete this.get(lroom).players[id];
		}

		// update or create
		player = this.players[id] || new Player(playerObj);
		this.players[id] = player;

		// does the current room exist?
		if(this.exists(info)) {
			// const playerInRoom = this.players[id]; // this.get(info).players[player.id];
			
			// add player to room;
			this.get(info).players[id] = playerInRoom || player;
			// set player with room
			player.room = info.id;

			console.log('adding', player, info.id);
		}
		else return false;
		return true;
	}
	getPlayers(info, player) {
		if(this.exists(info)) return Object.values(this.get(info).players);
		else return [];
	}
	add(info) {
		if(!info) throw new Error('no room info');
		if(this.list[info.id]) return;

		this.list[info.id] = Room(info);
	}
	remove(info) {
		delete this.list[info.id];
	}
	reset(info) {
		this.list[info.id] = Room(info);
	}
	resetAll() {
		this.list = {};
	}
	exists(info) {
		return !!this.list[info.id];
	}
	hasGame(info) {
		return !!this.list[info.id] && !!this.list[info.id].game;
	}
	get(info) {
		return this.list[info.id];
	}
	forEach(cb) {
		Object.values(this.list).forEach(cb);
	}
	map(cb) {
		return Object.values(this.list).map(cb);
	}
	filter(cb) {
		return Object.values(this.list).filter(cb);
	}
}

module.exports = { Room, rooms: new Rooms() };