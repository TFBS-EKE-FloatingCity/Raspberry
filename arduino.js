const { parentPort } = require('worker_threads');
// source of data Faker or Arduino for real arduino
// './comm/Faker' or './comm/Arduino'
const Arduino = require('./comm/Faker')

let commands = [];

async function init() {
    const arduino = new Arduino('/dev/spidev0.0', 1e6);
    parentPort.on('message', message => { commands.push(message); });

    while(true) {
        await sleep(100);
        
        let command = commands.shift()
        if (!command) { command = ''; }

        // TODO real size 3 bytes * 10 sensors
        // sadly the raspberry pi needs to be the master of the spi communication
		arduino.transfer(command, 3 * 10, (error, result) => {
            parentPort.postMessage({ data: result })
        });
    }
}
  
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

init();
