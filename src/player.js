function Player(from, pic) {
    return {
      pic,
      hp: 8,
      hpMax: 8,
      dm: 3,
      name: from.username,
      id: from.id,
      from: from,
      room: '-1001428794592' // MetaStage Community
    };
  }
  
module.exports = { Player };