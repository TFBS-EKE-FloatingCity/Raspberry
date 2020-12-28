import { SpiDevice } from 'spi-device';

export interface ISPIConfig {
    devices: IDeviceConfig[];
}

export interface IDevice {
    spiDevice: SpiDevice;
    name: string;
}
