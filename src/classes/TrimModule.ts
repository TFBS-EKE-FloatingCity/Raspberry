import { IModule } from "../interfaces/socket-payload";
import { Sector } from "../interfaces/common";
import { config } from "../config";

const overflowMargin = 3;

export class TrimModule implements IModule {
    pumpLevel: number;

    sector: Sector;

    sensorInside: number;

    sensorOutside: number;

    // For debugging
    hasOverflow = false;

    averageAim: number = 0;

    constructor(module: IModule) {
        this.pumpLevel = module.pumpLevel;
        this.sector = module.sector;
        this.sensorInside = module.sensorInside;
        this.sensorOutside = module.sensorOutside;
        this.checkForOverflows();
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
        return this.sensorInside <= config.sensorConfig.innerBounds.min + overflowMargin;
    }

    public hasInnerMaxOverflow(): boolean {
        return this.sensorInside >= config.sensorConfig.innerBounds.max - overflowMargin;
    }

    public hasOuterMinOverflow(): boolean {
        return this.sensorOutside <= config.sensorConfig.outerBounds.min + overflowMargin;
    }

    public hasOuterMaxOverflow(): boolean {
        return this.sensorOutside >= config.sensorConfig.outerBounds.max - overflowMargin;
    }

    public setPumpSpeed(average: number, energyBalance: number, additionalPumpSpeed: number = 0): number {
        const calculatedPumpSpeed = this.calculatePumpSpeed(average);
        if (Math.round(calculatedPumpSpeed + additionalPumpSpeed + energyBalance) < 0) {
            if (this.hasInnerMinOverflow() || this.hasOuterMinOverflow()) {
                this.pumpLevel = 0;
                return calculatedPumpSpeed + additionalPumpSpeed;
            }
        } else if (Math.round(calculatedPumpSpeed + additionalPumpSpeed + energyBalance) > 0) {
            if (this.hasInnerMaxOverflow() || this.hasOuterMaxOverflow()) {
                this.pumpLevel = 0;
                return calculatedPumpSpeed + additionalPumpSpeed;
            }
        }
        this.pumpLevel = Math.round(calculatedPumpSpeed + additionalPumpSpeed + energyBalance);
        return 0;
    }

    private calculatePumpSpeed(average: number): number {
        this.averageAim = average;
        const difference = average - this.sensorOutside;
        const { fullSpeedMargin } = config.sensorConfig;
        const { minimumMargin } = config.sensorConfig;

        if (Math.abs(difference) <= minimumMargin) {
            return 0;
        }

        if (difference < 0) {
            // Stadt soll runter => negativer Pumpspeed
            if (difference < fullSpeedMargin * -1) {
                return -100;
            }
            return ((difference / fullSpeedMargin) * 100);
        } if (difference > 0) {
            // Stadt soll rauf => positiver Pumpspeed
            if (difference > fullSpeedMargin) {
                return 100;
            }
            return ((difference / fullSpeedMargin) * 100);
        }
        return 0;
    }
}
