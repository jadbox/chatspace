function Player(name, pic) {
    return {
      pic,
      hp: 8,
      hpMax: 8,
      dm: 3,
      name: name,
    };
  }
  
module.exports = { Player };