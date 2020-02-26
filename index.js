const { Worker } = require('worker_threads');
const express = require('express')
const app = express()
const port = 3000

let data = {};

const worker = new Worker('./arduino.js');
worker.on('message', message => { data[message.data[0]] = [message.data[1], message.data[2]]; console.log(message.data); });

app.get('/', (req, res) => res.send(data))

app.listen(port, () => console.log(`Ready to accept requests on port ${port}!`))