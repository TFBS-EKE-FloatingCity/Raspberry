import { Sector } from './common';

export interface IModule {
    // sector name
    sector: Sector;

    // eg 150mm
    sensorOutside: number;

    // eg 150mm
    sensorInside: number;

    // -100% - 100%
    pumpLevel: number;
}

export interface ISensorData {
    timestamp: number;
    modules: [IModule, IModule, IModule];
}

export interface ISocketSimulationData {
    timestamp: number;
    // 0% - 100%
    sun: number;

    // 0% - 100%
    wind: number;

    /**
     * -100% - 100%
     *
     * * "-" : not enough energy is being generated, therefore water must be pumped out
     * * "+" : enough energy is being generated, therefore water must be pumped in
     */
    energyBalance: number;
}
