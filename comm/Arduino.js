const ArduinoInterface = require('./ArduinoInterface')
const SPI = require('pi-spi')

class Arduino extends ArduinoInterface
{
    constructor(device, speed)
    {
        super(device, speed);

        this.spi = SPI.initialize(this.device);
    }

    read(readcount, cb)
    {
        this.spi.read(readcount, cb);
    }

    write(data, cb)
    {
        this.spi.write(data, cb);
    }
}

module.exports = Arduino;