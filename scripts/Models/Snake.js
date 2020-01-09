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
      console.log(this.Inputbuffer);
      if (lastkey != direction) {
        if (lastkey != 'right' && direction == 'left') {
          this.Inputbuffer.push('left');
        } else if (lastkey != 'down' && direction == 'up') {
          this.Inputbuffer.push('up');
        } else if (lastkey != 'left' && direction == 'right') {
          this.Inputbuffer.push('right');
        } else if (lastkey != 'up' && direction == 'down') {
          this.Inputbuffer.push('down');
        }
        let jsonstring = JSON.stringify(this);
        let message = new Paho.MQTT.Message(jsonstring, 2);
        message.destinationName = 'ktest';
        mqtt.send(message);
      }
    });
  this.Movesnake = function() {
    console.log('moving: ', this);
    let tailend;
    let newhead;
    let direction = this.Inputbuffer[0];
    if (this.Inputbuffer.length > 1) {
      direction = this.Inputbuffer.shift();
    }
    if (direction == 'down') {
      newhead = [this.Tail[0][0] + 1, this.Tail[0][1]];
      tailend = this.Tail.pop();
      this.Tail.unshift(newhead);
    } else if (direction == 'up') {
      newhead = [this.Tail[0][0] - 1, this.Tail[0][1]];
      tailend = this.Tail.pop();
      this.Tail.unshift(newhead);
    } else if (direction == 'left') {
      newhead = [this.Tail[0][0], this.Tail[0][1] - 1];
      tailend = this.Tail.pop();
      this.Tail.unshift(newhead);
    } else if (direction == 'right') {
      newhead = [this.Tail[0][0], this.Tail[0][1] + 1];
      tailend = this.Tail.pop();
      this.Tail.unshift(newhead);
    }

    // check if the snake ate the fruit
    if (fruit[0] == newhead[0] && fruit[1] == newhead[1]) {
      this.Tail.push(tailend);
      generatefruit();
    }

    // check if the snake ate the candy
    if (candy[0] == newhead[0] && candy[1] == newhead[1]) {
      if (this.Tail.length > 3) {
        this.Tail.pop();
      }
      generatecandy();
    }

    // check if the snake ate himself
    for (let t = 1; t < this.Tail.length; t++) {
      let Tailpiece = this.Tail[t];
      if (Tailpiece[0] == newhead[0] && Tailpiece[1] == newhead[1]) {
        stop = true;
        console.log('u dead boi!!');
      }
    }
    // check if the snake went off screen and should die
    try {
      // console.log('he should die right here: ', gamewidth / scalefactor - 1);
      // console.log(this.Tail[0][1]);
      if (this.Tail[0][0] <= 0 || this.Tail[0][0] > gameheight / scalefactor - 1) {
        console.log('u dead boi');
        throw 'u dead';
      } else if (this.Tail[0][1] <= 0 || this.Tail[0][1] > gamewidth / scalefactor - 1) {
        console.log('u dead boi');
        throw 'u dead';
      }
    } catch {
      this.Isalive = false;
      console.log('u dead boi');
      stop = true;
    }
  };
}
