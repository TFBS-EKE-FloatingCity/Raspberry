import { getLogger } from 'log4js';
const logger = getLogger('config');
//Todo: type me

let configBuilder = null;
try {
    configBuilder = require('../config.json')
} catch (e) {
    logger.error(`Could not find ../config.json`, e)
}