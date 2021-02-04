import { getLogger } from "log4js";
import { IModule } from "../interfaces/socket-payload";
import Store, { StateStore } from "../store/Store";
import { ISpiData } from "../interfaces/spi-service";

const logger = getLogger(`fake-data-service`);

export class FakeDataService {
    toResetTime: Date = new Date(1000);
    // Use this if you want to send test data

    public fakeSPICommunication(trimData: ISpiData): [IModule, IModule, IModule] {
        if (this.toResetTime.getTime() < new Date().getTime()) {
            this.toResetTime = new Date(new Date().getTime() + 600000);
            logger.info(`Resetting Modules to initial => Happens every 10 minutes`);
            return StateStore.initialModules;
        }

        const data = Store.ModulesSubject.value;
        data.modules.forEach((module, index) => {
            const trimDataEntry = trimData.find((entry) => entry.sector === module.sector);
            if (trimDataEntry && trimDataEntry.pumpSpeed) {
                data.modules[index].pumpLevel = trimDataEntry.pumpSpeed;

                if (trimDataEntry.pumpSpeed < 0) {
                    data.modules[index].sensorOutside -= trimDataEntry.pumpSpeed < 50 ? 2 : 1;
                    data.modules[index].sensorInside -= trimDataEntry.pumpSpeed < 50 ? 2 : 1;
                } else if (trimDataEntry.pumpSpeed > 0) {
                    data.modules[index].sensorOutside += trimDataEntry.pumpSpeed > 50 ? 2 : 1;
                    data.modules[index].sensorInside += trimDataEntry.pumpSpeed > 50 ? 2 : 1;
                }
            }
            if (this.getOdds(200)) {
                logger.info(`Odds were good => upsetting module: ${data.modules[index].sector}`);
                if (this.coinFlip()) {
                    data.modules[index].sensorOutside += 40;
                    data.modules[index].sensorInside += 40;
                } else {
                    data.modules[index].sensorOutside -= 40;
                    data.modules[index].sensorInside -= 40;
                }
            }
        });
        return data.modules;
    }

    private getOdds(oneTo: number): boolean {
        return this.getRandomInt(0, oneTo) === oneTo - 1;
    }

    private coinFlip(): boolean {
        return Math.floor(Math.random() * 2) === 0;
    }

    private getRandomInt(min: number, max: number) {
        // eslint-disable-next-line no-param-reassign
        min = Math.ceil(min);
        // eslint-disable-next-line no-param-reassign
        max = Math.floor(max);
        return Math.round(Math.floor(Math.random() * (max - min)) + min);
    }
}
export const fakeDataService = new FakeDataService();
