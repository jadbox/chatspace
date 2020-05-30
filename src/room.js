const { Player } = require('./player');

class RoomInfo {
	constructor(info) {
		this.players = {};
		this.rooms = {};
		this.welcomeMsg =  {};
		this.game = null;
		this.info = info;
		this.id = info.id;
		this.title = info.title || info.username;
		this.name = info.username;
		this.private = info.type === 'private';
	}
	getLink() {
		if (!this.info.username) return null;
		return 'https://t.me/' + this.info.username;
	}
	numPlayers() {
		return Object.keys(this.players).length;
	}
}

function Room(info) {
  return new RoomInfo(info);
}

class Rooms {
  constructor() {
    this.list = {};
    this.players = {};
  }
  setPlayer(info, playerObj, forcePrivate) {
    const id = playerObj.id; //username;

    let player = this.players[id];
    if (!!player) {
      const lroom = player.room;
      // delete from last room
      if (lroom && this.exists(lroom)) delete this.get(lroom).players[id];
    }

    // update or create
    player = this.players[id] || new Player(playerObj);
    this.players[id] = player;

    // does the current room exist?
    this.add(info);
    // if not private or room has not been set yet
    if (info.type !== 'private' || !this.getPlayer(playerObj.id).room || forcePrivate) {
      // const playerInRoom = this.players[id]; // this.get(info).players[player.id];

      // add player to room;
      this.get(info).players[id] = player;
      // set player with room
      player.room = info.id;

      // console.log('Setting player room', player);
    }
  }
  getPlayer(id) {
    // let player = this.players[id];
    // player = this.players[id] || new Player(playerObj)
    return this.players[id];
  }
  getPlayerRoom(id) {
    if (!this.players[id]) return null;
    return this.get({ id: this.players[id].room });
  }
  getPlayers(info) {
    if (this.exists(info)) return Object.values(this.get(info).players);
    else return [];
  }
  add(info) {
	if (!info) throw new Error('no room info');
	if (!info.id) throw new Error('no room id info');
    if (this.list[info.id]) return;

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
