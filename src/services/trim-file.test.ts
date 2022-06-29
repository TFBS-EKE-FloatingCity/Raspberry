/* eslint-disable no-undef */
import { TrimService } from './trim-service';
import { ISensorData, ISocketSimulationData } from "../interfaces/socket-payload";
import { ISpiData } from "../interfaces/spi-service";

const trimService = new TrimService();
/**
 * !!!!!!!!!Tests are hardcoded for current config. When they fail => check if config.json is the same as config-backup-testing!!!!!!!!!!!!!
 */
describe(`Tests are hardcoded for config. When they fail => check if config.json is the same as config-backup-testing`, () => {
});
describe(`General testing`, () => {
    it(`General test`, () => {
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
                sensorOutside: 100,
                sensorInside: 100,
                pumpLevel: 0,
            }, {
                sector: `Two`,
                sensorOutside: 150,
                sensorInside: 150,
                pumpLevel: 0,
            }, {
                sector: `Three`,
                sensorOutside: 200,
                sensorInside: 200,
                pumpLevel: 0,
            }],
        };
        const data: ISpiData = trimService.trim({ ...testSensorData, ...simData });
        expect(data[0].pumpSpeed).toBe(100);
        expect(data[1].pumpSpeed).toBe(0);
        expect(data[2].pumpSpeed).toBe(-100);
    });

    it(`Test fullspeed margin 50%`, () => {
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
                sensorOutside: 140,
                sensorInside: 140,
                pumpLevel: 0,
            }, {
                sector: `Two`,
                sensorOutside: 150,
                sensorInside: 150,
                pumpLevel: 0,
            }, {
                sector: `Three`,
                sensorOutside: 160,
                sensorInside: 160,
                pumpLevel: 0,
            }],
        };
        const data: ISpiData = trimService.trim({ ...testSensorData, ...simData });
        expect(data[0].pumpSpeed).toBe(50);
        expect(data[1].pumpSpeed).toBe(0);
        expect(data[2].pumpSpeed).toBe(-50);
    });

    it(`Test fullspeed margin 25%`, () => {
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
                sensorOutside: 145,
                sensorInside: 145,
                pumpLevel: 0,
            }, {
                sector: `Two`,
                sensorOutside: 150,
                sensorInside: 150,
                pumpLevel: 0,
            }, {
                sector: `Three`,
                sensorOutside: 155,
                sensorInside: 155,
                pumpLevel: 0,
            }],
        };
        const data: ISpiData = trimService.trim({ ...testSensorData, ...simData });
        expect(data[0].pumpSpeed).toBe(25);
        expect(data[1].pumpSpeed).toBe(0);
        expect(data[2].pumpSpeed).toBe(-25);
    });

    it(`Test minimum margin`, () => {
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
                sensorOutside: 138,
                sensorInside: 138,
                pumpLevel: 18,
            }, {
                sector: `Two`,
                sensorOutside: 138,
                sensorInside: 138,
                pumpLevel: 18,
            }, {
                sector: `Three`,
                sensorOutside: 141,
                sensorInside: 141,
                pumpLevel: -17,
            }],
        };
        const data: ISpiData = trimService.trim({ ...testSensorData, ...simData });
        expect(data[0].pumpSpeed).toBe(0);
        expect(data[1].pumpSpeed).toBe(0);
        expect(data[2].pumpSpeed).toBe(0);
    });
});

describe(`Overflow testing`, () => {
    it(`"One" can not pump more water out`, () => {
        const simData: ISocketSimulationData = {
            sun: 0,
            energyBalance: 0,
            wind: 0,
            timestamp: 0,
        };
        const testSensorData: ISensorData = {
            timestamp: new Date().getTime(),
            modules: [{
                // Eher unten / Tank voll (Voll belastet)
                sector: `One`,
                sensorOutside: 100,
                sensorInside: 200,
                pumpLevel: 0,
            }, {
                sector: `Two`,
                sensorOutside: 150,
                sensorInside: 150,
                pumpLevel: 0,
            }, {
                // Hoch oben / Tank leer
                sector: `Three`,
                sensorOutside: 200,
                sensorInside: 200,
                pumpLevel: 0,
            }],
        };
        const data: ISpiData = trimService.trim({ ...testSensorData, ...simData });
        expect(data[0].pumpSpeed).toBe(0);
        expect(data[1].pumpSpeed).toBe(-33); // Down 33%
        expect(data[2].pumpSpeed).toBe(-100);// Down 100%
    });

    it(`Only "Three" can go down to adjust`, () => {
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
                sensorOutside: 100,
                sensorInside: 200,
                pumpLevel: 0,
            }, {
                sector: `Two`,
                sensorOutside: 100,
                sensorInside: 200,
                pumpLevel: 0,
            }, {
                sector: `Three`,
                sensorOutside: 200,
                sensorInside: 200,
                pumpLevel: 0,
            }],
        };
        const data: ISpiData = trimService.trim({ ...testSensorData, ...simData });
        expect(data[0].pumpSpeed).toBe(0);
        expect(data[1].pumpSpeed).toBe(0);
        expect(data[2].pumpSpeed).toBe(-100);
    });

    it(`Ignore energybalance when overflow`, () => {
        const simData: ISocketSimulationData = {
            sun: 0,
            energyBalance: 100,
            wind: 0,
            timestamp: 0,
        };
        const testSensorData: ISensorData = {
            timestamp: new Date().getTime(),
            modules: [{
                sector: `One`,
                sensorOutside: 100,
                sensorInside: 200,
                pumpLevel: 0,
            }, {
                sector: `Two`,
                sensorOutside: 100,
                sensorInside: 100,
                pumpLevel: 0,
            }, {
                sector: `Three`,
                sensorOutside: 100,
                sensorInside: 100,
                pumpLevel: 0,
            }],
        };
        const data: ISpiData = trimService.trim({ ...testSensorData, ...simData });
        expect(data[0].pumpSpeed).toBe(0);
        expect(data[1].pumpSpeed).toBe(100);
        expect(data[2].pumpSpeed).toBe(100);
    });

    it(`Ignore energybalance when double overflow`, () => {
        const simData: ISocketSimulationData = {
            sun: 0,
            energyBalance: 100,
            wind: 0,
            timestamp: 0,
        };
        const testSensorData: ISensorData = {
            timestamp: new Date().getTime(),
            modules: [{
                sector: `One`,
                sensorOutside: 100,
                sensorInside: 200,
                pumpLevel: 0,
            }, {
                sector: `Two`,
                sensorOutside: 100,
                sensorInside: 200,
                pumpLevel: 0,
            }, {
                sector: `Three`,
                sensorOutside: 150,
                sensorInside: 150,
                pumpLevel: 0,
            }],
        };
        const data: ISpiData = trimService.trim({ ...testSensorData, ...simData });
        expect(data[0].pumpSpeed).toBe(0);
        expect(data[1].pumpSpeed).toBe(0);
        expect(data[2].pumpSpeed).toBe(-100);
    });
});

describe(`Full up / Full down testing`, () => {
    it(`Negative Energybalance full down`, () => {
        const simData: ISocketSimulationData = {
            sun: 0,
            energyBalance: -100,
            wind: 0,
            timestamp: 0,
        };
        const testSensorData: ISensorData = {
            timestamp: new Date().getTime(),
            modules: [{
                sector: `One`,
                sensorOutside: 30,
                sensorInside: 50,
                pumpLevel: 0,
            }, {
                sector: `Two`,
                sensorOutside: 30,
                sensorInside: 50,
                pumpLevel: 0,
            }, {
                sector: `Three`,
                sensorOutside: 30,
                sensorInside: 50,
                pumpLevel: 0,
            }],
        };
        const data: ISpiData = trimService.trim({ ...testSensorData, ...simData });
        expect(data[0].pumpSpeed).toBe(0);
        expect(data[1].pumpSpeed).toBe(0);
        expect(data[2].pumpSpeed).toBe(0);
    });

    it(`Positiv Energybalance full down`, () => {
        const simData: ISocketSimulationData = {
            sun: 0,
            energyBalance: 100,
            wind: 0,
            timestamp: 0,
        };
        const testSensorData: ISensorData = {
            timestamp: new Date().getTime(),
            modules: [{
                sector: `One`,
                sensorOutside: 30,
                sensorInside: 50,
                pumpLevel: 0,
            }, {
                sector: `Two`,
                sensorOutside: 30,
                sensorInside: 50,
                pumpLevel: 0,
            }, {
                sector: `Three`,
                sensorOutside: 30,
                sensorInside: 50,
                pumpLevel: 0,
            }],
        };
        const data: ISpiData = trimService.trim({ ...testSensorData, ...simData });
        expect(data[0].pumpSpeed).toBe(100);
        expect(data[1].pumpSpeed).toBe(100);
        expect(data[2].pumpSpeed).toBe(100);
    });

    it(`Negative Energybalance full up`, () => {
        const simData: ISocketSimulationData = {
            sun: 0,
            energyBalance: -100,
            wind: 0,
            timestamp: 0,
        };
        const testSensorData: ISensorData = {
            timestamp: new Date().getTime(),
            modules: [{
                sector: `One`,
                sensorOutside: 250,
                sensorInside: 150,
                pumpLevel: 0,
            }, {
                sector: `Two`,
                sensorOutside: 250,
                sensorInside: 150,
                pumpLevel: 0,
            }, {
                sector: `Three`,
                sensorOutside: 250,
                sensorInside: 150,
                pumpLevel: 0,
            }],
        };
        const data: ISpiData = trimService.trim({ ...testSensorData, ...simData });
        expect(data[0].pumpSpeed).toBe(-100);
        expect(data[1].pumpSpeed).toBe(-100);
        expect(data[2].pumpSpeed).toBe(-100);
    });

    it(`Positiv Energybalance full up`, () => {
        const simData: ISocketSimulationData = {
            sun: 0,
            energyBalance: 100,
            wind: 0,
            timestamp: 0,
        };
        const testSensorData: ISensorData = {
            timestamp: new Date().getTime(),
            modules: [{
                sector: `One`,
                sensorOutside: 250,
                sensorInside: 150,
                pumpLevel: 0,
            }, {
                sector: `Two`,
                sensorOutside: 250,
                sensorInside: 150,
                pumpLevel: 0,
            }, {
                sector: `Three`,
                sensorOutside: 250,
                sensorInside: 150,
                pumpLevel: 0,
            }],
        };
        const data: ISpiData = trimService.trim({ ...testSensorData, ...simData });
        expect(data[0].pumpSpeed).toBe(0);
        expect(data[1].pumpSpeed).toBe(0);
        expect(data[2].pumpSpeed).toBe(0);
    });
});

describe(`Tank full / Tank empty testing`, () => {
    it(`Positiv Energybalance tank full`, () => {
        const simData: ISocketSimulationData = {
            sun: 0,
            energyBalance: 100,
            wind: 0,
            timestamp: 0,
        };
        const testSensorData: ISensorData = {
            timestamp: new Date().getTime(),
            modules: [{
                sector: `One`,
                sensorOutside: 50,
                sensorInside: 30,
                pumpLevel: 0,
            }, {
                sector: `Two`,
                sensorOutside: 50,
                sensorInside: 30,
                pumpLevel: 0,
            }, {
                sector: `Three`,
                sensorOutside: 50,
                sensorInside: 30,
                pumpLevel: 0,
            }],
        };
        const data: ISpiData = trimService.trim({ ...testSensorData, ...simData });
        expect(data[0].pumpSpeed).toBe(100);
        expect(data[1].pumpSpeed).toBe(100);
        expect(data[2].pumpSpeed).toBe(100);
    });

    it(`Negative Energybalance tank full`, () => {
        const simData: ISocketSimulationData = {
            sun: 0,
            energyBalance: -100,
            wind: 0,
            timestamp: 0,
        };
        const testSensorData: ISensorData = {
            timestamp: new Date().getTime(),
            modules: [{
                sector: `One`,
                sensorOutside: 50,
                sensorInside: 30,
                pumpLevel: 0,
            }, {
                sector: `Two`,
                sensorOutside: 50,
                sensorInside: 30,
                pumpLevel: 0,
            }, {
                sector: `Three`,
                sensorOutside: 50,
                sensorInside: 30,
                pumpLevel: 0,
            }],
        };
        const data: ISpiData = trimService.trim({ ...testSensorData, ...simData });
        expect(data[0].pumpSpeed).toBe(0);
        expect(data[1].pumpSpeed).toBe(0);
        expect(data[2].pumpSpeed).toBe(0);
    });

    it(`Positiv Energybalance tank empty`, () => {
        const simData: ISocketSimulationData = {
            sun: 0,
            energyBalance: 100,
            wind: 0,
            timestamp: 0,
        };
        const testSensorData: ISensorData = {
            timestamp: new Date().getTime(),
            modules: [{
                sector: `One`,
                sensorOutside: 150,
                sensorInside: 200,
                pumpLevel: 0,
            }, {
                sector: `Two`,
                sensorOutside: 150,
                sensorInside: 200,
                pumpLevel: 0,
            }, {
                sector: `Three`,
                sensorOutside: 150,
                sensorInside: 200,
                pumpLevel: 0,
            }],
        };
        const data: ISpiData = trimService.trim({ ...testSensorData, ...simData });
        expect(data[0].pumpSpeed).toBe(0);
        expect(data[1].pumpSpeed).toBe(0);
        expect(data[2].pumpSpeed).toBe(0);
    });

    it(`Negative Energybalance tank empty`, () => {
        const simData: ISocketSimulationData = {
            sun: 0,
            energyBalance: -100,
            wind: 0,
            timestamp: 0,
        };
        const testSensorData: ISensorData = {
            timestamp: new Date().getTime(),
            modules: [{
                sector: `One`,
                sensorOutside: 150,
                sensorInside: 200,
                pumpLevel: 0,
            }, {
                sector: `Two`,
                sensorOutside: 150,
                sensorInside: 200,
                pumpLevel: 0,
            }, {
                sector: `Three`,
                sensorOutside: 150,
                sensorInside: 200,
                pumpLevel: 0,
            }],
        };
        const data: ISpiData = trimService.trim({ ...testSensorData, ...simData });
        expect(data[0].pumpSpeed).toBe(-100);
        expect(data[1].pumpSpeed).toBe(-100);
        expect(data[2].pumpSpeed).toBe(-100);
    });
});
