import { BehaviorSubject } from 'rxjs';
import {
    IModule,
    ISensorData,
    ISocketSimulationData,
} from '../interfaces/socket-payload';

class StateStore {
    public SimDataSubject: BehaviorSubject<ISocketSimulationData>;

    public ModulesSubject: BehaviorSubject<ISensorData>;

    private _initialModules: [IModule, IModule, IModule] = [
        {
            sector: `One`,
            sensorOutside: 0,
            sensorInside: 0,
            pumpLevel: 0,
        },
        {
            sector: `Two`,
            sensorOutside: 0,
            sensorInside: 0,
            pumpLevel: 0,
        },
        {
            sector: `Three`,
            sensorOutside: 0,
            sensorInside: 0,
            pumpLevel: 0,
        },
    ];

    constructor() {
        this.SimDataSubject = new BehaviorSubject({
            sun: 0,
            wind: 0,
            energyBalance: 0,
        });

        this.ModulesSubject = new BehaviorSubject({
            timestamp: Date.now(),
            modules: this._initialModules,
        });
    }
}

const Store = new StateStore();

// freeze the object to create a singleton object
Object.freeze(Store);

export default Store;
