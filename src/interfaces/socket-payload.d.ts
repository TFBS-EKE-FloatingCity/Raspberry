export interface ISocketSensorData {
    modules: [IModule, IModule, IModule];
}

export interface IModule {
    // sector name
    sector: 'One' | 'Two' | 'Three';

    //eg 150mm
    sensorOutside: number;

    //eg 150mm
    sensorInside: number;

    // -100% - 100%
    pumpLevel: number;
}

export interface ISocketSimulationData {
    // 0% - 100%
    sun: number;

    // 0% - 100%
    wind: number;

    /**
     * -100% - 100%
     *
     * - : not enough energy is being generated, therefore water must be pumped out
     * + : enough energy is being generated, therefore water must be pumped in
     */
    energyBalance: number;
}
