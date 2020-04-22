const { parentPort } = require('worker_threads');
const request = require('request');
const config = require('./config.json')

let data = [];

async function init() {
    parentPort.on('message', rData => { data.push(rData); })
    
    while(true) {
        await sleep(config.sendInterval);
        // get current data 
        parentPort.postMessage({type: 'request'});
        await sleep(50);
        // post data to the aspnet application
        request.post(
            config.endpoint,
            { json: data },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    // clearing data as it has been successfuly sent
                    data = [];
                    // receive latest parameters
                    parentPort.postMessage({type: 'result', content: body});
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
