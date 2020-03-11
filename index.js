const { Worker } = require('worker_threads');
const express = require('express')
const app = express()
var http = require('http').createServer(app);
// var io = require('socket.io')(http);

var bodyParser = require('body-parser')
const port = 3000

let data = {};


const worker = new Worker('./arduino.js');
worker.on('message', message => { data[message.data[0]] = [message.data[1], message.data[2]]; });

const worker2 = new Worker('./aspnet.js');
worker2.on('message', message => { worker2.postMessage(data); });

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