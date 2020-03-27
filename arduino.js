const { parentPort } = require('worker_threads');
const Arduino = require('./comm/Faker')

let commands = [];

async function init() {
    const arduino = new Arduino('/dev/spidev0.0', 1e6);
    parentPort.on('message', message => { commands.push(message); });

    while(true) {
        await sleep(100);
        
        let command = commands.shift()
        if (!command) { command = ''; }

		arduino.transfer(command, 3 * 10, (error, result) => {
            // console.log(result.toString());
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
