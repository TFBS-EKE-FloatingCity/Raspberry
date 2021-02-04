import './logging';
import { getLogger } from 'log4js';
import express from 'express';
import compression from 'compression';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import { config } from './config';
import { socketService } from './services/socket-service';
import { spiService } from './services/spi-service';
import { MainService } from './services/main-service';

const logger = getLogger(`config`);
const app = express();

app.set(`port`, process.env.PORT || 8080);
app.use(compression());
app.use(helmet());
app.use(bodyParser.json());

app.get(`/ping`, (req, res) => {
    res.send(`pong`);
});
app.use(`/*`, (req, res) => {
    res.status(404).send({
        message: `Not Found`,
    });
});
const server = app.listen(app.get(`port`), () => {
    logger.info(`listening on port ${app.get(`port`)}`);
});

socketService.start(server);

if (spiService || config.spiServiceConfig.fakeSpiMode) {
    const mainService = new MainService(spiService, socketService);

    setInterval(
        async () => {
            await mainService.StartApp();
        },
        config.mainServiceConf.arduinoDelay,
    );
}
