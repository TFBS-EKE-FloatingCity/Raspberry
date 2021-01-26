import {TrimService} from './trim-service';
import {IModule, ISensorData} from "../interfaces/socket-payload";
import {ISpiData} from "../interfaces/spi-service";

const trimService = new TrimService();

it('Test 1. general test', () => {
    const testSensorData: ISensorData = {
        timestamp: new Date().getTime(),
        modules: [{
            sector: "One",
            sensorOutside: 100,
            sensorInside: 100,
            pumpLevel: 0
        }, {
            sector: "Two",
            sensorOutside: 150,
            sensorInside: 150,
            pumpLevel: 0
        }, {
            sector: "Three",
            sensorOutside: 200,
            sensorInside: 200,
            pumpLevel: 0
        }]
    }
    const data: ISpiData = trimService.trim(testSensorData);
    expect(data[0].pumpSpeed).toBe(100);
    expect(data[1].pumpSpeed).toBe(0);
    expect(data[2].pumpSpeed).toBe(-100);
    console.log(JSON.stringify(data));
    console.log("Test 1. finished")
});

it('Test 2. Test fullspeed margin', () => {
    const testSensorData: ISensorData = {
        timestamp: new Date().getTime(),
        modules: [{
            sector: "One",
            sensorOutside: 140,
            sensorInside: 140,
            pumpLevel: 0
        }, {
            sector: "Two",
            sensorOutside: 150,
            sensorInside: 150,
            pumpLevel: 0
        }, {
            sector: "Three",
            sensorOutside: 160,
            sensorInside: 160,
            pumpLevel: 0
        }]
    }
    const data: ISpiData = trimService.trim(testSensorData);
    expect(data[0].pumpSpeed).toBe(50);
    expect(data[1].pumpSpeed).toBe(0);
    expect(data[2].pumpSpeed).toBe(-50);
    console.log(JSON.stringify(data));
    console.log("Test 1. finished")
});

it('Test 3. "One" can not pump more water out', () => {
    const testSensorData: ISensorData = {
        timestamp: new Date().getTime(),
        modules: [{
            sector: "One",
            sensorOutside: 100,
            sensorInside: 200,
            pumpLevel: 0
        }, {
            sector: "Two",
            sensorOutside: 150,
            sensorInside: 150,
            pumpLevel: 0
        }, {
            sector: "Three",
            sensorOutside: 200,
            sensorInside: 200,
            pumpLevel: 0
        }]
    }
    const data: ISpiData = trimService.trim(testSensorData);
    expect(data[0].pumpSpeed).toBe(0);
    expect(data[1].pumpSpeed).toBe(33);
    expect(data[2].pumpSpeed).toBe(100);
    console.log(JSON.stringify(data));
    console.log("Test 3. finished")
});
