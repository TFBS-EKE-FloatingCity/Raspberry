const Arduino = require('./Arduino')

const arduino = new Arduino('/dev/spidev0.0', 4e6);
arduino.read(3, (result) => {
    console.log(result);
});
