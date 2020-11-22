import './logging';
import './config'
import {getLogger} from 'log4js';
import express from 'express';
import compression from 'compression';
import helmet from 'helmet/dist';
import bodyParser from "body-parser";

const logger = getLogger('config');
const app = express();

app.set('port', process.env.PORT || 8080);
app.use(compression());
app.use(helmet());
app.use(bodyParser.json());




app.listen(app.get('port'), () => {
    logger.info(`listening on port ${app.get('port')}`);
});
