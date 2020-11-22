import { getLogger } from 'log4js';

const logger = getLogger('config');

export interface IFloatingCityConfig {
  endpoint: string;
}

let configBuilder = null;
try {
  // eslint-disable-next-line global-require
  configBuilder = require('../config.json');
} catch (e) {
  logger.error('Could not find ../config.json', e);
}

export const config: IFloatingCityConfig = configBuilder;
