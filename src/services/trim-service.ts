import { getLogger } from "log4js";
import { ISensorData, ISocketSimulationData } from "../interfaces/socket-payload";
import { ISpiData, ISpiModuleData } from "../interfaces/spi-service";
import { Sector } from "../interfaces/common";
import { TrimModule } from "../classes/TrimModule";

const logger = getLogger(`trim-service`);

type TrimData = ISocketSimulationData & ISensorData

export class TrimService {
    public trim(data: TrimData): ISpiData {
        if (!data || !data.modules) {
            throw new Error(`trim() => data was null`);
        }
        if (data.modules.length !== 3) {
            throw new Error(`trim() => data.modules had not 3 sections`);
        }

        // Find highest module
        const highest = data.modules.reduce((prevModule, currentModule) => ((prevModule.sensorOutside < currentModule.sensorOutside) ? currentModule : prevModule));
        // Find highest module
        const lowest = data.modules.reduce((prevModule, currentModule) => ((prevModule.sensorOutside > currentModule.sensorOutside) ? currentModule : prevModule));
        // Get remaining module which must be equal or in the middle
        const middle = data.modules.filter((module) => (module.sector !== highest.sector) && (module.sector !== lowest.sector))[0];

        const average = (highest.sensorOutside + middle.sensorOutside + lowest.sensorOutside) / 3;

        const trimModuleOne = new TrimModule(data.modules.filter((module) => module.sector === `One`)[0]);
        const trimModuleTwo = new TrimModule(data.modules.filter((module) => module.sector === `Two`)[0]);
        const trimModuleThree = new TrimModule(data.modules.filter((module) => module.sector === `Three`)[0]);

        const trimModules = [trimModuleOne, trimModuleTwo, trimModuleThree];

        /**
         *  **Dev Diagram**
         *  One: OutsideAverage = 150, Outside = 180, Inside = 30
         *  Two: OutsideAverage = 150, Outside = 135, Inside = 30
         *  Three: OutsideAverage = 150, Outside = 135, Inside = 50
         *  0 = -100 % |
         */

        let overFlowSpeed = 0;
        const iterations: number[][] = [[0, 1, 2]];

        // Check Iterations
        for (let outerIndex = 0; outerIndex < iterations.length; outerIndex += 1) {
            // Calculate Pumpspeeds and check for overflows
            // If overflow => code will run again without overflow module and overflowSpeed set to a value
            const iterationOverflow = overFlowSpeed;
            overFlowSpeed = 0;
            // eslint-disable-next-line no-restricted-syntax
            for (const innerIndex of iterations[outerIndex]) {
                if (iterations.length > 1) {
                    overFlowSpeed = trimModules[innerIndex].setPumpSpeed(average, 0, (iterationOverflow / (iterations[outerIndex].length)) * -1);
                } else {
                    overFlowSpeed = trimModules[innerIndex].setPumpSpeed(average, data.energyBalance, (iterationOverflow / (iterations[outerIndex].length)) * -1);
                }

                // overFlowSpeed = trimModules[innerIndex].setPumpSpeed(average, data.energyBalance, (iterationOverflow / (iterations[outerIndex].length)) * -1);

                // Was this a overflow?
                if (overFlowSpeed !== 0) {
                    // Add new Iteration because there was an overflow
                    iterations.push(iterations[outerIndex].filter((int) => int !== innerIndex));
                    break;
                }
            }
            if (iterations[outerIndex + 1] && iterations[outerIndex + 1].length === 0) {
                logger.error(`Error while trimming => Is everything in overflow?`);
                return TrimService.getNeutralSpiModuleData();
            }
        }

        // find biggest pump speed
        // eslint-disable-next-line max-len
        const biggestPumpSpeedFromZero = Math.abs(trimModules.reduce((prevModule, currentModule) => ((Math.abs(prevModule.pumpLevel) > Math.abs(currentModule.pumpLevel)) ? prevModule : currentModule)).pumpLevel);

        // check if biggestpumspeed is over 100% or less then -100%
        if (Math.abs(biggestPumpSpeedFromZero) > 100) {
            // Resize every pump speed value to max 100
            trimModules.forEach((module) => {
                // eslint-disable-next-line no-param-reassign
                module.pumpLevel = Math.round((module.pumpLevel / biggestPumpSpeedFromZero) * 100);

                // -0 was showing up in debugger so for safety reason i wrote this
                if (Object.is(module.pumpLevel, -0)) {
                    // eslint-disable-next-line no-param-reassign
                    module.pumpLevel = 0;
                }
            });
        }
        logger.debug(JSON.stringify(trimModules));

        return [
            TrimService.createSpiModuleData(`One`, trimModules[0].pumpLevel, data.wind),
            TrimService.createSpiModuleData(`Two`, trimModules[1].pumpLevel, data.wind),
            TrimService.createSpiModuleData(`Three`, trimModules[2].pumpLevel, data.wind),
        ];
    }

    private static getNeutralSpiModuleData(windmillSpeed: number = 0): ISpiData {
        return [
            TrimService.createSpiModuleData(`One`, 0, windmillSpeed),
            TrimService.createSpiModuleData(`Two`, 0, windmillSpeed),
            TrimService.createSpiModuleData(`Three`, 0, windmillSpeed),
        ];
    }

    private static createSpiModuleData(sector: Sector, pumpSpeed: number, windmillSpeed: number): ISpiModuleData {
        return {
            sector,
            pumpSpeed,
            windmillSpeed,
        };
    }
}
export const trimService = new TrimService();
