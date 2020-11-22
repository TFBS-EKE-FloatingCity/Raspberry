import { getLogger } from 'log4js';
import { IFloatingCityConfig } from '../config';

const logger = getLogger('socket-service');

class SocketService {
    // Todo: SocketServer
    public init(config: IFloatingCityConfig) {
        logger.info(JSON.stringify(config));
    }
}

export const socketService = new SocketService();
