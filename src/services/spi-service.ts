import { getLogger } from 'log4js';
import spi, { SpiDevice, SpiMessage } from 'spi-device';
import { IDeviceConfig, config } from '../config';
import { DeviceName } from '../interfaces/common';
import { IDevice, ISPIConfig } from '../interfaces/spi-service';

const logger = getLogger('config');

class Device implements IDevice {
    public spiDevice!: SpiDevice;
    public name!: string;

    constructor(conf: IDeviceConfig) {
        this.spiDevice = spi.openSync(conf.bus, conf.gpio);

        this.name = conf.name;
    }
}

class SpiService {
    public Devices: IDevice[] = [];

    constructor(config: ISPIConfig) {
        for (const controller of config.devices) {
            this.Devices.push(new Device(controller));
        }
    }

    transfer = (
        message: SpiMessage,
        deviceName: DeviceName,
        onReceiveCb: (message: SpiMessage) => void
    ) => {
        const device: Device | undefined = this.Devices.find(
            (device) => (device.name = deviceName)
        );

        if (!device) {
            throw new Error(`the device ${deviceName} was not found`);
        }
        device.spiDevice.transfer(message, (err, message) => {
            if (err) {
                logger.error(err);
            }
            onReceiveCb(message);
        });
    };
}

export const spiService = new SpiService({
    devices: [...config.mcDevices, config.ambientDevice],
});
