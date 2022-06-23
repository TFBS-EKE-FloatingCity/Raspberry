/* eslint-disable no-undef */
import { ISensorData, ISocketSimulationData } from "../interfaces/socket-payload";
import { ISpiData } from "../interfaces/spi-service";
import { trimService } from "./trim-service";
import { fakeDataService } from "./fake-data.service";

it(`Playground for Fake Data`, () => {
    const simData: ISocketSimulationData = {
        sun: 0,
        energyBalance: 0,
        wind: 0,
        timestamp: 0,
    };
    const testSensorData: ISensorData = {
        timestamp: new Date().getTime(),
        modules: [{
            sector: `One`,
            sensorOutside: 150,
            sensorInside: 150,
            pumpLevel: 0,
        }, {
            sector: `Two`,
            sensorOutside: 150,
            sensorInside: 150,
            pumpLevel: 0,
        }, {
            sector: `Three`,
            sensorOutside: 150,
            sensorInside: 150,
            pumpLevel: 0,
        }],
    };
    const data: ISpiData = trimService.trim({ ...testSensorData, ...simData });
    for (let i = 0; i < 100; i += 1) {
        fakeDataService.fakeSPICommunication(data);
    }
});
