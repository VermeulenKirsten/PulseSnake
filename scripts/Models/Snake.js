function Snake(name, id, tail, direction, speed, color = '#00FF00') {
  (this.Id = id),
    (this.Name = name),
    (this.Speed = speed),
    (this.Tail = tail),
    (this.Color = color),
    (this.Inputbuffer = [direction]),
    (this.score = 0),
    (this.topLength = 3),
    (this.distanceMoved = 0),
    (this.fruitEaten = 0),
    (this.candyEaten = 0),
    (this.topSpeed = 0),
    (this.fruitValue = 10),
    (this.candyValue = -4),
    (this.suicideValue = -15);
  this.Input = function(direction) {
    let lastkey = this.Inputbuffer[this.Inputbuffer.length - 1];
    if (lastkey != direction) {
      this.score += 1;
      if (lastkey != 'right' && direction == 'left') {
        this.Inputbuffer.push('left');
      } else if (lastkey != 'down' && direction == 'up') {
        this.Inputbuffer.push('up');
      } else if (lastkey != 'left' && direction == 'right') {
        this.Inputbuffer.push('right');
      } else if (lastkey != 'up' && direction == 'down') {
        this.Inputbuffer.push('down');
      } else if (direction == 'slow') {
        this.Speed -= 1;
      }
      let snakemessage = new Message('snake', this);
      let message = new Paho.MQTT.Message(JSON.stringify(snakemessage));
      message.destinationName = roomInfo.roomId;
      mqtt.send(message);
    }
  };
  this.Movesnake = function() {
    let tailend;
    let newhead;
    if (this.Inputbuffer.length > 1) {
      this.Inputbuffer.shift();
    }
    let direction = this.Inputbuffer[0];
    tailend = this.Tail.pop();
    if (direction == 'down') {
      newhead = [this.Tail[0][0] + 1, this.Tail[0][1]];
    } else if (direction == 'up') {
      newhead = [this.Tail[0][0] - 1, this.Tail[0][1]];
    } else if (direction == 'left') {
      newhead = [this.Tail[0][0], this.Tail[0][1] - 1];
    } else if (direction == 'right') {
      newhead = [this.Tail[0][0], this.Tail[0][1] + 1];
    }
    this.Tail.unshift(newhead);

    // host will check if the snake ate the fruit
    if (playerNr == 0) {
      let eaten = false;
      if (fruit[0] == newhead[0] && fruit[1] == newhead[1]) {
        this.Tail.push(tailend);
        generatefruit();
        eaten = true;
        this.fruitEaten += 1;
        this.score += this.fruitValue;
      }

      // check if the snake ate the candy
      if (candy[0] == newhead[0] && candy[1] == newhead[1]) {
        if (this.Tail.length > 3) {
          this.Tail.pop();
        }
        generatecandy();
        eaten = true;
        this.candyEaten += 1;
        this.score += this.candyValue;
      }

      if (eaten) {
        let message = new Paho.MQTT.Message(JSON.stringify(new Message('snake', this)));
        message.destinationName = roomInfo.roomId;
        mqtt.send(message);
      }
    }

    // check if the snake ate himself
    for (let t = 1; t < this.Tail.length; t++) {
      let Tailpiece = this.Tail[t];
      if (Tailpiece[0] == newhead[0] && Tailpiece[1] == newhead[1]) {
        oldLength = this.Tail.length;
        this.Tail.splice(t, this.Tail.length - t);
        newLength = this.Tail.length;
        lengthVerschil = (oldLength - newLength) / oldLength;
        this.score = Math.ceil(this.score * (1 - lengthVerschil));
        break;
      }
    }

    //move player to other side of screen when going off screen
    if (this.Tail[0][0] < 0 && this.Inputbuffer[0] == 'up') {
      newhead[0] = gameheight / scalefactor - 1;
    } else if (this.Tail[0][0] >= gameheight / scalefactor && this.Inputbuffer[0] == 'down') {
      newhead[0] = 0;
    } else if (this.Tail[0][1] < 0 && this.Inputbuffer[0] == 'left') {
      newhead[1] = gamewidth / scalefactor - 1;
    } else if (this.Tail[0][1] >= gamewidth / scalefactor && this.Inputbuffer[0] == 'right') {
      newhead[1] = 0;
    }

    // stats
    this.distanceMoved += 1;

    if (this.Tail.length > this.topLength) this.topLength = this.Tail.length;
    if (this.Speed < this.topSpeed) this.topSpeed = this.Speed;
    if (this.score < 0) this.score = 0;
  };
}
