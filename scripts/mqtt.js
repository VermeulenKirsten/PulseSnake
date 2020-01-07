let mqtt;
let reconnectTimeout = 1000;
let host = 'mct-mqtt.westeurope.cloudapp.azure.com';
let port = 80;

const onConnect = function() {
  console.log('Connected');
  mqtt.subscribe('ktest');
  let message = new Paho.MQTT.Message('Hello World');
  message.destinationName = 'ktest';
  mqtt.send(message);
};

const onFailure = function() {
  console.log('connection lost, reconnecting');
  setTimeout(MQTTconnect, reconnectTimeout);
};

const onMessageArrived = function(msg) {
  console.log('message:' + msg.payloadString);
};

const MQTTconnect = function() {
  console.log('connecting to ' + host);
  mqtt = new Paho.MQTT.Client(host, Number(port), 'kevin');
  let options = {
    timeout: 1,
    onSuccess: onConnect,
    onFailure: onFailure
  };
  mqtt.onMessageArrived = onMessageArrived;
  mqtt.connect(options);
};

document.addEventListener('DOMContentLoaded', function() {
  console.info('DOM geladen');
  MQTTconnect();
});
