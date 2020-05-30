function Player(from, pic) {
    return {
      pic,
      hp: 8,
      hpMax: 8,
      dm: 3,
      name: from.username,
      id: from.username,
      from: from,
      room: null
    };
  }
  
module.exports = { Player };