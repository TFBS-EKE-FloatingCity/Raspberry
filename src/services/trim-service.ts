import {IModule, ISensorData} from "../interfaces/socket-payload";
import {ISpiData, ISpiModuleData} from "../interfaces/spi-service";
import {config} from "../config";
import {Sector} from "../interfaces/common";
import * as Module from "module";
import {TrimModule} from "../classes/TrimModule";
import {getLogger} from "log4js";

const logger = getLogger('trim-service');

export class TrimService {
    public static trim(data: ISensorData): ISpiData {
        if (!data || !data.modules) {
            throw new Error(`trim() => data was null`)
        }
        if (data.modules.length !== 3) {
            throw new Error(`trim() => data.modules had not 3 sections`)
        }

        // Find highest module
        const highest = data.modules.reduce((prevModule, currentModule) => {
            return (prevModule.sensorOutside > currentModule.sensorOutside) ? prevModule : currentModule
        })
        // Find highest module
        const lowest = data.modules.reduce((prevModule, currentModule) => {
            return (prevModule.sensorOutside < currentModule.sensorOutside) ? prevModule : currentModule
        })
        // Get remaining module which must be equal or in the middle
        const middle = data.modules.filter(module => (module.sector !== highest.sector) && (module.sector !== lowest.sector))[0];

        // If under margin => do nothing
        if ((highest.sensorOutside - lowest.sensorOutside) <= config.sensorConfig.minimumMargin) {
            return TrimService.getNeutralSpiModuleData();
        }

        const average = (highest.sensorOutside + middle.sensorOutside + lowest.sensorOutside) / 3;

        const trimModuleOne = new TrimModule(data.modules.filter(module => module.sector === "One")[0]);
        const trimModuleTwo =  new TrimModule(data.modules.filter(module => module.sector === "Two")[0]);
        const trimModuleThree =  new TrimModule(data.modules.filter(module => module.sector === "Three")[0]);

        const trimModules = [trimModuleOne, trimModuleTwo, trimModuleThree]


        /**
         *  **Dev Diagram**
         *  One: OutsideAverage = 150, Outside = 180, Inside = 30
         *  Two: OutsideAverage = 150, Outside = 135, Inside = 30
         *  Three: OutsideAverage = 150, Outside = 135, Inside = 50
         *  0 = -100 % |
         */

        let overFlowSpeed = 0;
        const iterations: number[][] = [[0,1,2]]

        // Check Iterations
        for (let outerIndex = 0; outerIndex < iterations.length; outerIndex++) {
            // Calculate Pumpspeeds and check for overflows
            // If overflow => code will run again without overflow module and overflowSpeed set to a value
            const iterationOverflow = overFlowSpeed;
            overFlowSpeed = 0;
            for (let innerIndex of iterations[outerIndex]) {
                // TODO: Energy Balance (data.energyBalance)
                // overFlowSpeed = trimModules[innerIndex].setPumpSpeed(average, data.energyBalance, (iterationOverflow / (iterations[outerIndex].length)) * -1);
                overFlowSpeed = trimModules[innerIndex].setPumpSpeed(average, 0, (iterationOverflow / (iterations[outerIndex].length)) * -1);
                // Was this a overflow?
                if (overFlowSpeed !== 0) {
                    // Add new Iteration because there was an overflow
                    iterations.push(iterations[outerIndex].filter(int => int !== innerIndex));
                    break;
                }
            }
            if (iterations[outerIndex + 1] && iterations[outerIndex + 1].length === 0) {
                logger.error(`Error while trimming => Is everything in overflow?`)
                return TrimService.getNeutralSpiModuleData();
            }
        }


        // resize every pump speed to <= 100 / >= -100
        if (trimModules.findIndex(module => Math.abs(module.pumpLevel) > 100)) {
            // find biggest pump speed
            const biggestPumpSpeedFromZero = trimModules.reduce((prevModule, currentModule) => {
                    return (Math.abs(prevModule.pumpLevel) < Math.abs(currentModule.sensorOutside)) ? prevModule : currentModule
            }).pumpLevel

            // Resize every pump speed value to max 100
            trimModules.forEach(module => {
                module.pumpLevel = Math.round((module.pumpLevel / biggestPumpSpeedFromZero) * 100)
            })
        }

        //TODO: Insert windmill speed here
        return [
            TrimService.createSpiModuleData("One", trimModules[0].pumpLevel,0),
            TrimService.createSpiModuleData("Two", trimModules[1].pumpLevel,0),
            TrimService.createSpiModuleData("Three", trimModules[2].pumpLevel,0)
        ]
    }

    private static getNeutralSpiModuleData(windmillSpeed: number = 0): ISpiData {
        return [
            TrimService.createSpiModuleData("One",0,windmillSpeed),
            TrimService.createSpiModuleData("Two",0,windmillSpeed),
            TrimService.createSpiModuleData("Three",0,windmillSpeed)
        ]
    }

    private static createSpiModuleData(sector: Sector, pumpSpeed: number, windmillSpeed: number): ISpiModuleData {
        return {
            sector: sector,
            pumpSpeed: pumpSpeed,
            windmillSpeed: windmillSpeed
        }
    }
}