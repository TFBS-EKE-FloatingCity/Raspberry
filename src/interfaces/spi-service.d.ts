import { SpiDevice } from 'spi-device';
import { DeviceName } from './common';

export interface IDevice {
    spiDevice: SpiDevice;
    name: DeviceName;
}
