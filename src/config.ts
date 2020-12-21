import { getLogger } from 'log4js';
import { Sector } from './interfaces/common';

const logger = getLogger('config');

export interface IFloatingCityConfig {
  endpoint: string;
  mcDevices: [IDeviceConfig, IDeviceConfig, IDeviceConfig],
  ambientDevice: IDeviceConfig
}

export interface IDeviceConfig {
  gpio: number;
  bus: number;
  name: Sector | "Ambient"
}

let configBuilder = null;
try {
    // eslint-disable-next-line global-require
    configBuilder = require('../config.json');
} catch (e) {
    logger.error('Could not find ../config.json', e);
}

export const config: IFloatingCityConfig = configBuilder;
