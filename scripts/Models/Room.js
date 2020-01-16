function room(roomId) {
  (this.roomId = roomId), (this.players = []), (this.maxplayers = 4), this.defaultSpeed, this.gameDuration;

  this.addPlayer = function(newplayer) {
    let length = this.players.length;
    console.log(length);
    if (length < this.maxplayers) {
      newplayer.name = `Speler ${length + 1}`;
      this.players.push(newplayer);
      return true;
    } else {
      return false;
    }
  };
  this.updatePlayer = function(newplayer) {
    for (let player in this.players) {
      if (this.players[player].id == newplayer.id) {
        this.players[player] = newplayer;
        break;
      }
    }
    console.log(this.players);
  };
  this.removePlayer = function(id) {
    for (let i = 0; i < this.players.length; i++) {
      if (this.players[i].id == id) {
        console.log('delete', this.players[i]);
        console.log(this.players);
        this.players.splice(i, 1);
        for (let t = i; i < this.players.length; i++) {
          console.log('>>>', this.players[t].name, `Speler ${t + 2}`);
          if (this.players[t].name == `Speler ${t + 2}`) {
            console.log('t', t);
            this.players[t].name = `Speler ${t + 1}`;
          }
        }
      }
    }
  };
}
