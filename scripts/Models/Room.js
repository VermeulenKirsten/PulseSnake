function room(roomId) {
  (this.roomId = roomId),
    (this.players = []),
    (this.maxplayers = 4),
    this.defaultSpeed,
    this.gameDuration,
    (this.colors = ['#00FF00', '#0000FF', '#FFFF00', '#FF0000']);

  this.addPlayer = function(newplayer) {
    let length = this.players.length;
    if (length < this.maxplayers) {
      newplayer.name = `Speler ${length + 1}`;
      newplayer.color = this.colors[0];
      this.colors.shift();
      console.log(('co', this.colors));
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
  };
  this.removePlayer = function(id) {
    for (let i = 0; i < this.players.length; i++) {
      if (this.players[i].id == id) {
        this.colors.push(this.players[i].color);
        this.players.splice(i, 1);
        for (let t = i; i < this.players.length; i++) {
          if (this.players[t].name == `Speler ${t + 2}`) {
            this.players[t].name = `Speler ${t + 1}`;
          }
        }
      }
    }
  };
}
