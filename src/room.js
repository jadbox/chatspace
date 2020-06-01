const { Player } = require('./player');

class RoomInfo {
  constructor(info) {
    this.players = {};
    this.rooms = {};
    this.welcomeMsg = {};
    this.game = null;
    this.info = info;
    this.id = info.id;
    this.title = info.title || info.username;
    this.name = info.username || info.title;
    this.private = info.type === 'private' || !info.type;
    this.type = info.type;
  }
  getLink() {
    // console.log(this)
    if (!this.info.username) return 'https://t.me/' + this.info.username;
    if(!this.info.username) return this.info.title;
    return '@'+this.name;
    
  }
  numPlayers() {
    return Object.keys(this.players).length;
  }
  getVideoLink() {
    return `https://meet.jit.si/${this.info.username}`;
  }
}

function Room(info) {
  return new RoomInfo(info);
}

class Rooms {
  constructor() {
    this.list = {
      '-1001428794592': Room({
        id: -1001428794592,
        title: 'MetaRoom Community',
        username: 'MetaRoom',
        type: 'supergroup',
      }),
    };
    this.players = {};
  }
  setPlayer(info, playerObj) {
    const id = playerObj.id; //username;

    this.add(info);
    let player = this.getPlayer(playerObj); // this.players[id];
    // if (!!player) {
    // new Player(playerObj);
    // this.setPlayer(, this.players[id]);

    const lroom = player.room;
    // delete from last room
    if (lroom && this.exists(lroom)) {
      if (lroom.id === info.id) {
        // console.log('already in room');
        return false;
      }
      delete this.get(lroom).players[id];
    }
    // }

    // update or create
    /* if(!player) {
      this.setPlayer(info, player);
    }*/
    // player = player || new Player(playerObj);
    // this.players[id] = player;

    // does the current room exist?
    
    // if not private or room has not been set yet
    // if (info.type !== 'private' || !this.getPlayer(playerObj.id).room || forcePrivate) {
    // const playerInRoom = this.players[id]; // this.get(info).players[player.id];

    // add player to room;
    this.get(info).players[id] = player;
    // set player with room
    player.room = info.id;

    return true;
  }
  getPlayer(upsertPlayerObj) {
    if (!upsertPlayerObj.id) throw new Error('no player id');

    const id = upsertPlayerObj.id;
    // let player = this.players[id];
    // player = this.players[id] || new Player(playerObj)
    if (!this.players[id]) {
      const p = (this.players[id] = Player(upsertPlayerObj));
      this.add(upsertPlayerObj); // create players room
      this.setPlayer(this.getPlayerRoom(p), p);
    }

    return this.players[id];
  }
  getPlayerRoom(info) {
    if (!info.id) throw new Error('no player id');
    const p = this.getPlayer(info);

    //  if (!this.players[id]) return null;
    return this.get({ id: p.room });
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
