const { parentPort } = require('worker_threads');
const request = require('request');

let data = [];
let oldData = [];

async function init() {
    parentPort.on('message', message => { data = message; });
    
    while(true) {
        await sleep(5000);
        parentPort.postMessage("bruh");
        await sleep(10);
        request.post(
            'http://localhost:1234',
            { json: data },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.log(body);
                } else {
                    console.error(error);
                }
            }
        );
    }
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

init();
