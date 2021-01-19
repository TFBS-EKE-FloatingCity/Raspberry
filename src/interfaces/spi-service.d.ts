import { SpiDevice } from 'spi-device';
import { DeviceName } from './common';
import {Sector} from "./common";
import {IDeviceConfig} from "../config";

export interface ISPIConfig {
    devices: IDeviceConfig[];
}

export interface IDevice {
    spiDevice: SpiDevice;
    name: DeviceName;
}

export interface ISpiModuleData {
    // Sector name
    sector: Sector;

    // Pumpspeed (-100 - 100)
    pumpSpeed: number;

    // Windmill speed (0 - 100)
    windmillSpeed: number;
}

export type ISpiData = [ISpiModuleData, ISpiModuleData, ISpiModuleData];