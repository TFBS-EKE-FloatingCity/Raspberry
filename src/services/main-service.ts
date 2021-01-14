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

        console.log(this.currentMeasurements);

        await this.socketService.sendSensorData({
            timestamp: Date.now(),
            modules: this.currentMeasurements as [IModule, IModule, IModule],
        });

        // TODO use in Prod environment
        // if (this.currentMeasurements.length === 3) {

        // } else {
        //     logger.warn(
        //         'the Measurements of exactly three Modules are required!'
        //     );
        // }

        // repeat Measurement after configured delay
        setTimeout(this.StartApp, this.conf.arduinoDelay);
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
                    Buffer.from([30, 45, 20, 10])
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

                    // TODO skip offset 0 because the first byte is padding ?
                    const module: IModule = {
                        sector: curr.name as Sector,
                        sensorInside: msg[0].receiveBuffer.readInt8(1) ?? 0,
                        sensorOutside: msg[0].receiveBuffer.readInt8(2) ?? 0,
                        pumpLevel: msg[0].receiveBuffer.readInt8(3) ?? 0,
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
