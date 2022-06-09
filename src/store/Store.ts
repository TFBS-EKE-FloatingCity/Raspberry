import { BehaviorSubject } from 'rxjs';
import {
    IModule,
    ISensorData,
    ISocketSimulationData,
} from '../interfaces/socket-payload';
import { config } from "../config";

export class StateStore {
    public SimDataSubject: BehaviorSubject<ISocketSimulationData>;

    public ModulesSubject: BehaviorSubject<ISensorData>;

    public static initialModules: [IModule, IModule, IModule] = [
        {
            sector: `One`,
            sensorOutside: config.sensorConfig.outerBounds.max - ((config.sensorConfig.outerBounds.max - config.sensorConfig.outerBounds.min) / 2),
            sensorInside: config.sensorConfig.innerBounds.max - ((config.sensorConfig.innerBounds.max - config.sensorConfig.innerBounds.min) / 2),
            pumpLevel: 0,
        },
        {
            sector: `Two`,
            sensorOutside: config.sensorConfig.outerBounds.max - ((config.sensorConfig.outerBounds.max - config.sensorConfig.outerBounds.min) / 2),
            sensorInside: config.sensorConfig.innerBounds.max - ((config.sensorConfig.innerBounds.max - config.sensorConfig.innerBounds.min) / 2),
            pumpLevel: 0,
        },
        {
            sector: `Three`,
            sensorOutside: config.sensorConfig.outerBounds.max - ((config.sensorConfig.outerBounds.max - config.sensorConfig.outerBounds.min) / 2),
            sensorInside: config.sensorConfig.innerBounds.max - ((config.sensorConfig.innerBounds.max - config.sensorConfig.innerBounds.min) / 2),
            pumpLevel: 0,
        },
    ];

    constructor() {
        this.SimDataSubject = new BehaviorSubject({
            timestamp: new Date().getTime() - config.socketServerConfig.simulationTimeout,
            sun: 0,
            wind: 0,
            energyBalance: 0,
        });

        this.ModulesSubject = new BehaviorSubject({
            timestamp: Date.now(),
            modules: StateStore.initialModules,
        });
    }
}

const Store = new StateStore();

// freeze the object to create a singleton object
Object.freeze(Store);

export default Store;
