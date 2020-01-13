function Snake(name, id, tail, direction, speed, color = '#00FF00') {
  (this.Id = id),
    (this.Name = name),
    (this.Speed = speed),
    (this.Tail = tail),
    (this.Color = color),
    (this.Inputbuffer = [direction]),
    (this.Isalive = true),
    (this.Input = function(direction) {
      let lastkey = this.Inputbuffer[this.Inputbuffer.length - 1];
      if (lastkey != direction) {
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
    });
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
        console.log('tail: ', this.Tail, 'tailend', tailend);
        generatefruit();
        eaten = true;
      }

      // check if the snake ate the candy
      if (candy[0] == newhead[0] && candy[1] == newhead[1]) {
        if (this.Tail.length > 3) {
          this.Tail.pop();
        }
        generatecandy();
        eaten = true;
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
        stop = true;
        console.log('u dead boi!!');
        let message = new Paho.MQTT.Message(JSON.stringify(new Message('gameOver', { snake: this, method: 'ate himself' })));
        message.destinationName = roomInfo.roomId;
        mqtt.send(message);
      }
    }
    // check if the snake went off screen and should die
    // console.log('he should die right here: ', gamewidth / scalefactor - 1);
    // console.log(this.Tail[0][1]);

    // if (this.Tail[0][0] <= -1 || this.Tail[0][0] > gameheight / scalefactor - 1) {
    //   console.log('u dead boi');
    // } else if (this.Tail[0][1] <= -1 || this.Tail[0][1] > gamewidth / scalefactor - 1) {
    //   console.log('u dead boi');
    // }
    if (this.Tail[0][0] < 0 && this.Inputbuffer[0] == 'up') {
      newhead[0] = gameheight / scalefactor - 1;
    } else if (this.Tail[0][0] >= gameheight / scalefactor && this.Inputbuffer[0] == 'down') {
      newhead[0] = 0;
    } else if (this.Tail[0][1] < 0 && this.Inputbuffer[0] == 'left') {
      newhead[1] = gamewidth / scalefactor - 1;
    } else if (this.Tail[0][1] >= gamewidth / scalefactor && this.Inputbuffer[0] == 'right') {
      newhead[1] = 0;
    }
    // this.Tail.unshift(newhead);
    // this.Isalive = false;
    // console.log('u dead boi');
    // let message = new Paho.MQTT.Message(JSON.stringify(new Message('gameOver', { snake: this, method: 'went off screen' })));
    // message.destinationName = roomInfo.roomId;
    // mqtt.send(message);

    // stop = true;
  };
}
