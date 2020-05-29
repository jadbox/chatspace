function Player(name, from, pic) {
    return {
      pic,
      hp: 8,
      hpMax: 8,
      dm: 3,
      name: name,
      from: from,
      id: name
    };
  }
  
module.exports = { Player };