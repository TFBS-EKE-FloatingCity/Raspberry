import {IModule} from "../interfaces/socket-payload";
import {Sector} from "../interfaces/common";
import {config} from "../config";

const overflowMargin = 3;

export class TrimModule implements IModule {
    pumpLevel: number;
    sector: Sector;
    sensorInside: number;
    sensorOutside: number;

    hasOverflow = false;

    constructor(module: IModule) {
        this.pumpLevel = module.pumpLevel;
        this.sector = module.sector;
        this.sensorInside = module.sensorInside;
        this.sensorOutside = module.sensorOutside;
    }

    public checkForOverflows() {
        this.hasOverflow = this.hasInnerMinOverflow();
        if (this.hasOverflow) return this.hasOverflow;

        this.hasOverflow = this.hasInnerMaxOverflow();
        if (this.hasOverflow) return this.hasOverflow;

        this.hasOverflow = this.hasOuterMinOverflow();
        if (this.hasOverflow) return this.hasOverflow;

        this.hasOverflow = this.hasOuterMaxOverflow();
        if (this.hasOverflow) return this.hasOverflow;

        return false;
    }

    public hasInnerMinOverflow(): boolean {
        return this.sensorInside <= config.sensorConfig.innerBounds.min + overflowMargin
    }
    public hasInnerMaxOverflow(): boolean {
        return this.sensorInside >= config.sensorConfig.innerBounds.max - overflowMargin
    }
    public hasOuterMinOverflow(): boolean {
        return this.sensorOutside <= config.sensorConfig.outerBounds.min + overflowMargin
    }
    public hasOuterMaxOverflow(): boolean {
        return this.sensorOutside >= config.sensorConfig.outerBounds.max - overflowMargin
    }

    public setPumpSpeed(average: number, energyBalance: number, additionalPumpSpeed: number = 0): number {
        const calculatedPumpSpeed = this.calculatePumpSpeed(average);
        if (calculatedPumpSpeed < 0) {
            if (this.hasInnerMinOverflow() || this.hasOuterMinOverflow()) {
                this.pumpLevel = 0;
                return calculatedPumpSpeed + additionalPumpSpeed;
            }
        } else if (calculatedPumpSpeed > 0) {
            if (this.hasInnerMaxOverflow() || this.hasOuterMaxOverflow()) {
                this.pumpLevel = 0;
                return calculatedPumpSpeed + additionalPumpSpeed;
            }
        }
        this.pumpLevel = calculatedPumpSpeed + additionalPumpSpeed + energyBalance;
        return 0;
    }

    private calculatePumpSpeed(average: number): number {
        const difference = average - this.sensorOutside;
        if (difference < 0 ) {
            // Stadt soll runter => negativer Pumpspeed
            if (difference > config.sensorConfig.fullSpeedMargin * -1) {
                return -100;
            } else {
                return ((difference / config.sensorConfig.fullSpeedMargin) * 100)
            }
        } else if (difference > 0) {
            // Stadt soll rauf => positiver Pumpspeed
            if (difference > config.sensorConfig.fullSpeedMargin) {
                return 100;
            } else {
                return ((difference / config.sensorConfig.fullSpeedMargin) * 100)
            }
        } else {
            return 0;
        }
    }
}