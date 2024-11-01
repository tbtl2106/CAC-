'use strict';

const chalk = require('chalk');
require('dotenv').config()

var connectionString = process.env.CONNECT_STRING;
var Mqtt = require('azure-iot-device-mqtt').Mqtt;
var DeviceClient = require('azure-iot-device').Client
var Message = require('azure-iot-device').Message;

var client = DeviceClient.fromConnectionString(connectionString, Mqtt);

// Timeout created by setInterval
var intervalLoop = null;

// Function to handle the SetTelemetryInterval direct method call from IoT hub
function onSetTelemetryInterval(request, response) {
  // Function to send a direct method reponse to your IoT hub.
  function directMethodResponse(err) {
    if(err) {
      console.error(chalk.red('An error ocurred when sending a method response:\n' + err.toString()));
    } else {
        console.log(chalk.green('Response to method \'' + request.methodName + '\' sent successfully.' ));
    }
  }

  console.log(chalk.green('Direct method payload received:'));
  console.log(chalk.green(request.payload));

  // Check that a numeric value was passed as a parameter
  if (isNaN(request.payload)) {
    console.log(chalk.red('Invalid interval response received in payload'));
    // Report failure back to your hub.
    response.send(400, 'Invalid direct method parameter: ' + request.payload, directMethodResponse);

  } else {

    // Reset the interval timer
    clearInterval(intervalLoop);
    intervalLoop = setInterval(sendMessage, request.payload * 1000);

    // Report success back to your hub.
    response.send(200, 'Telemetry interval set: ' + request.payload, directMethodResponse);
  }
}


var SerialPort = require('serialport');
var Readline = SerialPort.parsers.Readline;
var port = new SerialPort('/dev/ttyS0');
var parser = new Readline();
port.pipe(parser);

function sendMessage(data){

    let req = {}

    data.split("&").forEach(function(kv){
        let v=0, k = kv.split("=")
        v = k[1]
        k = k[0]
        req[k] = /\d+.?\d*/.exec(v)[0]
    })
    req['lat'] = process.env.LAT
    req['long'] = process.env.LONG

  var temperature = 20 + (Math.random() * 15);
  var message = new Message(JSON.stringify(req));



  // Add a custom application property to the message.
  // An IoT hub can filter on these properties without access to the message body.
  message.properties.add('temperatureAlert', (temperature > 30) ? 'true' : 'false');

  console.log('Sending message: ' + message.getData());

  // Send the message.
  client.sendEvent(message, function (err) {
    if (err) {
      console.error('send error: ' + err.toString());
    } else {
      console.log('message sent');
    }
  });
}

// Set up the handler for the SetTelemetryInterval direct method call.
// client.onDeviceMethod('SetTelemetryInterval', onSetTelemetryInterval);

// Create a message and send it to the IoT hub, initially every second.
parser.on('data', sendMessage);
