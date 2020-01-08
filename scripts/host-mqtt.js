let mqtt;
let reconnectTimeout = 100;
let host = 'mct-mqtt.westeurope.cloudapp.azure.com';
let port = 80;
let roomInfo;

const checkGame = function() {
  if (roomId) {
  }
};

const onConnect = function() {
  console.log('Connected');
  let suboptions = {
    qos: 1
  };
  mqtt.subscribe('0001', suboptions);
};

const onFailure = function() {
  console.log('connection lost, reconnecting');
  setTimeout(MQTTconnect, reconnectTimeout);
};

const onMessageArrived = function(msg) {
  console.log('message:', msg.payloadString);
  let incommingMessage = JSON.parse(msg.payloadString);
  switch (incommingMessage.type) {
    case 'player':
      {
        let newplayer = incommingMessage.message;
        if (roomInfo.players.length < 4) {
          console.log(roomInfo);
          roomInfo.addPlayer(newplayer);
          console.table(roomInfo);
          message = new Paho.MQTT.Message(JSON.stringify(new Message('roominfo', roomInfo)));
          message.destinationName = '0001';
          mqtt.send(message);
          showplayers();
        } else {
          message = new Paho.MQTT.Message(JSON.stringify(new Message('error', 'room full')));
          message.destinationName = '0001';
          mqtt.send(message);
        }
      }
      break;
    case 'disconnect':
      {
        console.log('disconnect', incommingMessage.message);
        roomInfo.removePlayer(incommingMessage.message);
        // for (let i = 0; i < roomInfo.players.length; i++) {
        //   if (roomInfo.players[i].name == incommingMessage.message) {
        //     console.log('delete', roomInfo.players[i]);
        //     roomInfo.players.pop(i);
        //   }
        // }
      }
      break;
    case 'roominfo': {
    }
    default:
      console.log('not existing type:', incommingMessage);
  }
};

const MQTTconnect = function(name) {
  console.log('connecting to ' + host);
  mqtt = new Paho.MQTT.Client(host, Number(port), name);
  let options = {
    timeout: 0,
    onSuccess: onConnect,
    onFailure: onFailure
  };
  mqtt.onMessageArrived = onMessageArrived;
  mqtt.connect(options);
};
