const { Worker } = require('worker_threads');
const express = require('express')
const app = express()
var http = require('http').createServer(app);
// var io = require('socket.io')(http);

var bodyParser = require('body-parser')
const port = 3000

let data = {};
let simData = {};

// Receiving data from arduino
const worker = new Worker('./arduino.js');
worker.on('message', message => { data[message.data[0]] = [message.data[1], message.data[2]]; });

const worker2 = new Worker('./aspnet.js');
worker2.on('message', message => { 
    if(message.type === 'request') {
        worker2.postMessage(format()); 
    } else if (message.type === 'result') {
        if(message.data.Wind) {
            if(!simData['Wind'] || simData['Wind'] != message.data.Wind) {
                simData['Wind'] = message.data.Wind;
                worker.postMessage([0x01, 0x00, 0x00]); // TODO add magic to convert the double (8 bytes) into (2 bytes)
            }
        }

        if(message.data.Sun) {
            if(!simData['Sun'] || simData['Sun'] != message.data.Sun) {
                simData['Sun'] = message.data.Sun;
                worker.postMessage([0x02, 0x00, 0x00]); // TODO add magic to convert the double (8 bytes) into (2 bytes)
            }
        }

        if(message.data.Consumption) {
            if(!simData['Consumption'] || simData['Consumption'] != message.data.Consumption) {
                simData['Consumption'] = message.data.Consumption;
                worker.postMessage([0x03, 0x00, 0x00]); // TODO add magic to convert the double (8 bytes) into (2 bytes) 
            }
        }
    }
});

/**
 * Format data for transfer to aspnet application
 */
function format()
{
    let result = [];
    
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            const element = data[key];
            result.push({
                Sensor: key,
                Value0: element[0],
                Value1: element[1],
                Timestamp: new Date().getTime(),
            });
        }
    }

    return result;
}

/**
 * Old code which currently stays
 * It is unused but can be use for debugging proposes
 */
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', (req, res) => res.send(format(data)))
app.post('/send', (req, res) => {
    if(req.body.command) {
        worker.postMessage(req.body.command)
        res.send('Success')
        return;
    }
    res.send('Failed')
});

http.listen(port, () => console.log(`Ready to accept requests on port ${port}!`))