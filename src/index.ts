import './logging';
import { getLogger } from 'log4js';
import express from 'express';
import compression from 'compression';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import { config } from './config';
import { socketService } from './services/socket-service';
import { spiService } from './services/spi-service';
import { SpiMessage } from 'spi-device';

const logger = getLogger('config');
const app = express();

app.set('port', process.env.PORT || 8080);
app.use(compression());
app.use(helmet());
app.use(bodyParser.json());

app.get('/ping', (req, res) => {
    res.send('pong');
});
app.use('/*', (req, res) => {
    res.status(404).send({
        message: 'Not Found',
    });
});
const server = app.listen(app.get('port'), () => {
    logger.info(`listening on port ${app.get('port')}`);
});

socketService.start(server);

try {
    const message: SpiMessage = [
        {
            sendBuffer: Buffer.from([5, 0xd0, 0x00, 0x01]), // Sent to read channel 5
            receiveBuffer: Buffer.alloc(4), // Raw data read from channel 5
            byteLength: 4,
            speedHz: 16000, // Use a low bus speed to get a good reading from the TMP36
        },
    ];

    setInterval(
        () => spiService.transfer(message, 'One', (msg) => console.log(msg)),
        5000
    );
} catch (error) {
    logger.warn(
        "make sure that you're not running in docker mode and that SPI is active on the Raspberry Pi"
    );
}
