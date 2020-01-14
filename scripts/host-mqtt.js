let mqtt;
let reconnectTimeout = 100;
let host = 'mct-mqtt.westeurope.cloudapp.azure.com';
let port = 80;
let roomInfo;

// ***********  when succesfully connected to broker ***********

const onConnect = function() {
  console.log('Connected');
  let suboptions = {
    qos: 1
  };
  mqtt.subscribe(roomInfo.roomId, suboptions);
  let message = new Paho.MQTT.Message(JSON.stringify(new Message('lobbyReady', '')));
  message.destinationName = roomInfo.roomId;
  mqtt.send(message);
};
// ***********  not succesfully connected to broker ***********

const onFailure = function() {
  console.log('connection lost, reconnecting');
  setTimeout(MQTTconnect, reconnectTimeout);
};
// ***********  when a message arrives ***********

const onMessageArrived = function(msg) {
  console.log('message:', msg.payloadString);
  let incommingMessage = JSON.parse(msg.payloadString);
  switch (incommingMessage.type) {
    case 'player':
      {
        let newplayer = incommingMessage.message;
        if (roomInfo.players.length < 4) {
          roomInfo.addPlayer(newplayer);
          message = new Paho.MQTT.Message(JSON.stringify(new Message('roomInfo', roomInfo)));
          message.destinationName = roomInfo.roomId;
          mqtt.send(message);
          showplayers();
        } else {
          message = new Paho.MQTT.Message(JSON.stringify(new Message('error', { toId: newplayer.id, errorMessage: 'room full' })));
          message.destinationName = roomInfo.roomId;
          mqtt.send(message);
        }
      }
      break;
    case 'disconnect':
      {
        roomInfo.removePlayer(incommingMessage.message);
        showplayers();
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
// ***********  connect to broker ***********

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
