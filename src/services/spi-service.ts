// eslint-disable-next-line max-classes-per-file
import { getLogger } from 'log4js';
import spi, { SpiDevice, SpiMessage } from 'spi-device';
import { IDeviceConfig, config, ISpiServiceConfig } from '../config';
import { DeviceName } from '../interfaces/common';
import { IDevice } from '../interfaces/spi-service';

const logger = getLogger(`spi-service`);

class Device implements IDevice {
    public spiDevice!: SpiDevice;

    public name!: DeviceName;

    constructor(conf: IDeviceConfig) {
        this.spiDevice = spi.openSync(conf.bus, conf.gpio);

        this.name = conf.name;
    }
}

export class SpiService {
    public Devices: IDevice[] = [];

    private conf: ISpiServiceConfig;

    constructor(configParam: ISpiServiceConfig) {
        this.conf = configParam;
        // eslint-disable-next-line no-restricted-syntax
        for (const controller of [...configParam.mcDevices, configParam.ambientDevice]) {
            this.Devices.push(new Device(controller));
        }
    }

    /**
     * sends a spi message
     *
     * @param message
     * @param deviceName
     * @param onReceiveCb
     *
     */
    transfer = (
        message: SpiMessage,
        deviceName: DeviceName,
        // eslint-disable-next-line no-unused-vars
        onReceiveCb: (receiveMessage: SpiMessage) => void,
    ) => {
        const device: Device | undefined = this.Devices.find(
            // eslint-disable-next-line no-param-reassign,no-return-assign
            (deviceEntry) => (deviceEntry.name = deviceName),
        );

        if (!device) {
            throw new Error(`the device ${deviceName} was not found`);
        }
        device.spiDevice.transfer(message, (err, receiveMessage) => {
            if (err) {
                logger.error(err);
            }
            onReceiveCb(receiveMessage);
        });
    };

    /**
     * creates a Spi message
     *
     * @param sendBuffer message to send
     *
     */
    public createSpiMessage(sendBuffer: Buffer): SpiMessage {
        return [
            {
                sendBuffer,
                receiveBuffer: Buffer.alloc(this.conf.byteLength),
                byteLength: this.conf.byteLength,
                speedHz: this.conf.speedHz,
            },
        ];
    }
}

// if SPI deactivated or the app is running in a docker environment (server)
// the spi-service will be null
let service: SpiService | null = null;

try {
    service = new SpiService(config.spiServiceConfig);
} catch (error) {
    logger.error(
        `can't initialize the spi service! make sure that you're not running in docker mode and that SPI is active on the Raspberry Pi`,
        error,
    );
}

export const spiService = service;
