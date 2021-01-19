import {IModule, ISensorData} from "../interfaces/socket-payload";
import {ISpiData, ISpiModuleData} from "../interfaces/spi-service";
import {config} from "../config";
import {Sector} from "../interfaces/common";

const minimumMarginInMM = config && config.sensorConfig && config.sensorConfig.minimumMargin ? config.sensorConfig.minimumMargin : 3;
const fullSpeedMarginInMM = config && config.sensorConfig && config.sensorConfig.fullSpeedMargin ? config.sensorConfig.fullSpeedMargin : 20;

export class TrimService {

    public static trim(data: ISensorData): ISpiData {
        if (!data || !data.modules) {
            throw new Error(`trim() => data was null`)
        }
        if (data.modules.length !== 3) {
            throw new Error(`trim() => data.modules had not 3 sections`)
        }
        const moduleSpeed = [0,0,0]

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
        if ((highest.sensorOutside - lowest.sensorOutside) <= minimumMarginInMM) {
            return [
                TrimService.createSpiModuleData("One",0,0),
                TrimService.createSpiModuleData("Two",0,0),
                TrimService.createSpiModuleData("Three",0,0)
            ]
        }

        const average = (highest.sensorOutside + middle.sensorOutside + lowest.sensorOutside) / 3;

        moduleSpeed[0] = TrimService.calculatePumpSpeed(average, data.modules.filter(module => module.sector === "One")[0]);
        moduleSpeed[1] = TrimService.calculatePumpSpeed(average, data.modules.filter(module => module.sector === "Two")[0]);
        moduleSpeed[2] = TrimService.calculatePumpSpeed(average, data.modules.filter(module => module.sector === "Three")[0]);

        // TODO: Check if out of bounds and rearange speeds

        return [
            TrimService.createSpiModuleData("One", moduleSpeed[0],0),
            TrimService.createSpiModuleData("Two", moduleSpeed[1],0),
            TrimService.createSpiModuleData("Three", moduleSpeed[2],0)
        ]
    }

    private static calculatePumpSpeed(average: number, module: IModule): number {
        const difference = average - module.sensorOutside;
        if (difference < 0 ) {
            if (difference > fullSpeedMarginInMM * -1) {
                return 100;
            } else {
                return ((fullSpeedMarginInMM / difference) * 100)
            }
        } else if (difference > 0) {
            if (difference > fullSpeedMarginInMM) {
                return 100;
            } else {
                return ((fullSpeedMarginInMM / difference) * 100)
            }
        } else {
            return 0;
        }
    }

    private static createSpiModuleData(sector: Sector, pumpSpeed: number, windmillSpeed: number): ISpiModuleData {
        return {
            sector: sector,
            pumpSpeed: pumpSpeed,
            windmillSpeed: windmillSpeed
        }
    }
}