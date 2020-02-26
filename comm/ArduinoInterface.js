class ArduinoInterface {
    constructor(device, speed) {
        this.device = device;
        this.speed = speed;
    }

    write(data, cb) {
        throw "Missing implementation";
    }
    
    read(data, cb) {
        throw "Missing implementation";
    }
}

module.exports = ArduinoInterface;