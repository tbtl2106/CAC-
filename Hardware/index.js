module.exports = async function (context, IoTHubMessages) {
    context.log(`JavaScript eventhub trigger function called for message array: ${IoTHubMessages}`);

    var count = 0;
    var totalRain = 0.0;
    var totalMoisture = 0.0, x = 0.0, y = 0.0, z = 0.0, totalGyX = 0.0, totalGyY = 0.0, totalGyZ = 0.0;
    var totalTmp = 0;
    var deviceId = "sensor_pi_1";
    var lat = 0, long = 0;

    IoTHubMessages.forEach(message => {
        context.log(`Processed message: ${message}`);
        count++;
        totalRain += message.rain;
        x += message.AcX;
        y += message.AcY;
        z += message.AcZ;
        totalTmp += message.Tmp;
        totalGyX += message.GyX;
        totalGyY += message.GyY;
        totalGyZ += message.GyZ;
        lat = message.lat;
        long = message.long;
        totalMoisture += message.moisture;
        deviceId = message.deviceId;
    });

    var roll = Math.abs(Math.round(Math.abs(Math.atan(x / y)) * 57.3) - 90)
    var acc = Math.abs(Math.round(Math.atan(-x / Math.sqrt(y * y + z * z)) * 57.3))
    var timestamp = Math.round(Date.now() / 1000);
    var riskFactor = ((roll + acc) / 90 + (Math.abs(totalRain / 100 - 1) + Math.abs(totalMoisture / 100 - 1)) * 1023 / 1446) / 2;



    var output = {
        'entryUUID': deviceId,
        'status': 0,
        'accl_x': x / count,
        'accl_y': y / count,
        'accl_z': z / count,
        'gyro_x': totalGyX / count,
        'lat': lat,
        'long': long,
        'gyro_y': totalGyY / count,
        'gyro_z': totalGyZ / count,
        'roll': roll,
        'pitch': pitch,
        'rain': totalRain / count,
        'soil': totalMoisture / count,
        'createdDate': timestamp,
        "deviceID": deviceId,
        "riskFactor": riskFactor,
        "measurementsCount": count,
    };


    context.log(`Output content: ${output}`);

    context.log(JSON.stringify(output))
    context.bindings.alertDocument = JSON.stringify(output);

    context.done();
};
