import { getLogger } from 'log4js';
import { SpiMessage } from 'spi-device';
import { IMainServiceConf } from '../config';
import { Sector } from '../interfaces/common';
import { IModule } from '../interfaces/socket-payload';
import { SocketService } from './socket-service';
import { SpiService } from './spi-service';

//TODO Send LED commands
//TODO send Arduino commands

const logger = getLogger('main-service');

export class MainService {
    private conf: IMainServiceConf;

    private currentMeasurements: IModule[] = [];

    private spiService: SpiService;

    private socketService: SocketService;

    /**
     * constructor
     */
    constructor(
        config: IMainServiceConf,
        spiService: SpiService,
        socketService: SocketService
    ) {
        this.conf = config;
        this.spiService = spiService;
        this.socketService = socketService;
    }

    /**
     * Entry Point
     */
    public async StartApp() {
        this.currentMeasurements = this.readSensorData();

        if (this.currentMeasurements.length === 3) {
            await this.socketService.sendSensorData({
                timestamp: Date.now(),
                modules: this.currentMeasurements as [
                    IModule,
                    IModule,
                    IModule
                ],
            });
        } else {
            logger.warn(
                'the Measurements of exactly three Modules are required!'
            );
        }
    }

    /**
     * retrieves the sensor data of all slaves
     */
    public readSensorData(): IModule[] {
        const modules = this.spiService.Devices.reduce<IModule[]>(
            (acc, curr) => {
                // skip the Ambient LEDs Controller
                if (curr.name === 'Ambient') {
                    return acc;
                }

                // TODO real data?!
                const msg: SpiMessage = this.spiService.createSpiMessage(
                    Buffer.from([30, 45, 20, 10, 10, 5])
                );

                // send message
                curr.spiDevice.transferSync(msg);

                /**
                 * the received data is stored into the message object
                 * we sent only one message, so the index is always 0
                 */
                if (msg[0].receiveBuffer) {
                    logger.info(
                        `successfully received data from sector ${curr.name}!`
                    );

                    // TODO check if & works
                    const module: IModule = {
                        sector: curr.name as Sector,
                        sensorInside:
                            msg[0].receiveBuffer.readInt8(0) &
                            msg[0].receiveBuffer.readInt8(1),
                        sensorOutside:
                            msg[0].receiveBuffer.readInt8(2) &
                            msg[0].receiveBuffer.readInt8(3),
                        pumpLevel: msg[0].receiveBuffer.readInt8(4) ?? 0,
                        // windMill: msg[0].receiveBuffer.readInt8(5) ?? 0,
                    };

                    acc.push(module);
                } else {
                    logger.error(
                        `couldn't read the sensor data of sector ${curr.name}`
                    );
                }

                return acc;
            },
            []
        );

        return modules;
    }
}
