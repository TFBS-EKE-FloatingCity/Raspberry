const { parentPort } = require('worker_threads');
const Arduino = require('./comm/Arduino')

async function init() {
    const arduino = new Arduino('/dev/spidev0.0', 4e6);

    while(true) {
        // await sleep(100);
        arduino.read(3, (error, result) => {
            arduino.write(result, () => {})
            // parentPort.postMessage({ data: result })
        });    
    }
}
  
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

init();
