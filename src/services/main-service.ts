import { getLogger } from 'log4js';
import { SpiMessage } from 'spi-device';
import { Sector } from '../interfaces/common';
import { IModule } from '../interfaces/socket-payload';
import { SocketService } from './socket-service';
import { SpiService } from './spi-service';
import { ISpiData } from '../interfaces/spi-service';
import { TrimService } from './trim-service';
import Store from '../store/Store';
import {config} from "../config";
import {fakeDataService} from "./fake-data.service";

const logger = getLogger(`main-service`);

export class MainService {
    private spiService: SpiService;

    private socketService: SocketService;

    private trimService: TrimService;

    /**
     * constructor
     */
    constructor(spiService: SpiService, socketService: SocketService) {
        this.spiService = spiService;
        this.socketService = socketService;
        this.trimService = new TrimService();

        // subscribe the socket service to the modules subject
        Store.ModulesSubject.subscribe(async (data) => {
            await this.socketService.sendSensorData(data);
        });

        // subscribe the ambient device to the simulation subject
        Store.SimDataSubject.subscribe((data) => {
            const ambientDevice = this.spiService.Devices.find(
                (d) => d.name === `Ambient`,
            );

            // send six bytes, where only the first byte has real data (sun data from the simulation)
            const message = this.spiService.createSpiMessage(
                Buffer.from([data.sun, 0, 0, 0, 0, 0]),
            );

            if (!ambientDevice) {
                logger.error(`the ambient device was not found!`);

                return;
            }

            ambientDevice?.spiDevice.transferSync(message);

            if (message[0].receiveBuffer) {
                logger.info(
                    `successfully sent the sun simulation data to ambient device!`,
                );
            }
        });
    }

    /**
     * Entry Point
     */
    public async StartApp() {
        // trim data using current measurements
        const trimData = this.trimService.trim({
            ...Store.ModulesSubject.value,
            ...Store.SimDataSubject.value,
        });

        // send the trimmed data to Arduinos
        // and write their current measurements into the store
        if (!config.spiServiceConfig.fakeSpiMode) {
            Store.ModulesSubject.next({
                timestamp: Date.now(),
                modules: this.sendCommandAndReadSensorData(trimData),
            });
        } else {
            Store.ModulesSubject.next({
                timestamp: Date.now(),
                modules: fakeDataService.fakeSPICommunication(trimData),
            });
        }
    }

    /**
     * retrieves the sensor data of all slaves
     */
    public sendCommandAndReadSensorData(
        spiData: ISpiData,
    ): [IModule, IModule, IModule] {
        const modules = this.spiService.Devices.reduce<IModule[]>(
            (acc, curr) => {
                // skip the Ambient LEDs Controller
                if (curr.name === `Ambient`) {
                    return acc;
                }

                const data = spiData.find((s) => s.sector === curr.name);

                if (!data) {
                    logger.error(
                        `couldn't retrieve Spi Data for sector ${curr.name}`,
                    );
                    return acc;
                }

                // We want to use unsigned int so we bump up percentage span to 0 - 200
                if (data.pumpSpeed) {
                    data.pumpSpeed += 100;
                }

                // TODO test
                const msg: SpiMessage = this.spiService.createSpiMessage(
                    Buffer.from([
                        data?.pumpSpeed,
                        data?.windmillSpeed,
                        0,
                        0,
                        0,
                        0,
                    ]),
                );

                // send message
                curr.spiDevice.transferSync(msg);

                /**
                 * the received data is stored into the message object
                 * we sent only one message, so the index is always 0
                 */
                if (msg[0].receiveBuffer) {
                    logger.info(
                        `successfully received data from sector ${curr.name}!`,
                    );

                    // TODO check if & works
                    const module: IModule = {
                        sector: curr.name as Sector,
                        sensorInside: msg[0].receiveBuffer.readUInt16BE(0),
                        sensorOutside: msg[0].receiveBuffer.readUInt16BE(2),
                        pumpLevel:
                            (msg[0].receiveBuffer.readUInt8(4) ?? 100) - 100,
                    };

                    acc.push(module);
                } else {
                    logger.error(
                        `couldn't read the sensor data of sector ${curr.name}`,
                    );
                }

                return acc;
            },
            [],
        );

        return modules as [IModule, IModule, IModule];
    }
}
