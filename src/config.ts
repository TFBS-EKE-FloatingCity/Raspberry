import { getLogger } from 'log4js';
import { DeviceName } from './interfaces/common';

const logger = getLogger(`config`);

export interface IDeviceConfig {
    gpio: number;
    bus: number;
    name: DeviceName;
}

export interface IMainServiceConf {
    /** timeout, after which the Raspberry will request data from the Arduino-Devices */
    arduinoDelay: number;
}

export interface ISpiServiceConfig {
    /** number of bytes to receive */
    byteLength: number;
    /** spi clock speed */
    speedHz: number;
    mcDevices: [IDeviceConfig, IDeviceConfig, IDeviceConfig];
    ambientDevice: IDeviceConfig;
}
export interface IMinMax {
    min: number;
    max: number;
}
export interface ISensorConfig {
    minimumMargin: number;
    fullSpeedMargin: number;
    outerBounds: IMinMax;
    innerBounds: IMinMax;
}
export interface IFloatingCityConfig {
    spiServiceConfig: ISpiServiceConfig;
    mainServiceConf: IMainServiceConf;
    sensorConfig: ISensorConfig;
}

let configBuilder = null;
try {
    // eslint-disable-next-line global-require
    configBuilder = require(`../config.json`);
} catch (e) {
    logger.error(`Could not find ../config.json`, e);
}

export const config: IFloatingCityConfig = configBuilder;
