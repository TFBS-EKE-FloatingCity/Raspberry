import { Sector } from './common';

export interface IMeasurement {
    deviceName: Sector;
    innerSensor: number;
    windmillSpeed: number;
}
