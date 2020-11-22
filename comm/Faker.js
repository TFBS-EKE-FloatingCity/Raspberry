const ArduinoInterface = require('./ArduinoInterface')

const fakeData = [
    [0x00, 0x32, 0x80],
    [0x01, 0x22, 0x80],
    [0x02, 0x12, 0x80],
    [0x03, 0x35, 0x80],
    [0x04, 0x64, 0x80],
    [0x05, 0x23, 0x80],
    [0x06, 0x65, 0x80],
    [0x07, 0x87, 0x80],
    [0x08, 0x12, 0x80],
    [0x09, 0x43, 0x80],
    [0x10, 0x76, 0x80],
    [0x11, 0x43, 0x80],
    [0x12, 0x31, 0x80]
];

class Faker extends ArduinoInterface
{
    constructor(device, speed)
    {
        super(device, speed);
    }

    read(readcount, cb)
    {
        cb(null, Buffer.from([Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)]));
    }

    write(data, cb)
    {
        cb(null, 'Im just fake');
    }

    transfer(data, incount, cb)
    {
        cb(null, Buffer.from([Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)]));
    }
}

module.exports = Faker;