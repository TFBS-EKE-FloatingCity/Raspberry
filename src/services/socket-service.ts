import { getLogger } from 'log4js';
import { Server as HttpServer } from 'http';
import SocketIO, { Server as SocketIOServer } from 'socket.io';
import { v4 as uuidGenerator } from 'uuid';

import { IWebsocketConnection, IWebsocketMessage, IWebsocketResponse } from '../interfaces/socket-service';
import { ISensorData } from "../interfaces/socket-payload";
import Store from '../store/Store';
import {config} from "../config";

const logger = getLogger(`socket-service`);

export class SocketService {
    // @ts-ignore
    socketIOServer: SocketIOServer;

    connections: IWebsocketConnection[] = [];

    public start(server: HttpServer) {
        logger.info(`start socket.io server`);
        this.socketIOServer = new SocketIO(server);
        this.socketIOServer.on(`connect`, (socket) => {
            const uuid = uuidGenerator();
            logger.info(`new client try's to connect`);
            socket.on(`authenticate`, () => {
                // TODO: Authenticate ??
                this.connections.push({
                    uuid,
                    socket,
                    messageQueue: [],
                });
                logger.info(`new client ${uuid} is connected. ${this.connections.length} client(s) now connected.`);
            });
            socket.once(`disconnect`, () => {
                logger.info(`client ${uuid} is disconnecting`);
                this.connections.splice(this.connections.findIndex((c) => c.uuid === uuid), 1);
                logger.info(`client disconnected. ${this.connections.length} client(s) now connected.`);
            });
        });
    }

    public async sendSensorData(data: ISensorData) {
        if (this.connections) {
            if (this.connections.length > 0) {
                // eslint-disable-next-line no-restricted-syntax
                for (const connection of this.connections) {
                    if (connection.messageQueue.length === 0) {
                        // Set response event handler
                        connection.socket.on(`sensorDataResponse`, (responseData: IWebsocketResponse) => {
                            logger.info(`sensorDataResponse: ${responseData.uuid} - ${responseData.status}`);
                            // acknowledge responseData and delete it out of message queue
                            if (responseData && responseData.status === `ack` && responseData.uuid) {
                                connection.messageQueue.splice(connection.messageQueue.findIndex((message) => message.uuid === responseData.uuid), 1);

                                // write sim state into store
                                if (responseData.sun || responseData.wind || responseData.energyBalance) {
                                    Store.SimDataSubject.next({
                                        sun: responseData.sun,
                                        wind: responseData.wind,
                                        energyBalance: responseData.energyBalance,
                                    });
                                }
                                logger.debug(JSON.stringify(responseData));
                            } else {
                                logger.warn(`message: ${responseData.uuid} from user: ${connection.uuid} was not ack`);
                            }
                            // remove event listeners if no messages are pending
                            if (connection.messageQueue.length === 0) {
                                connection.socket.removeAllListeners(`sensorDataResponse`);
                            }
                        });
                    }

                    // create new socket message object
                    const socketMessage: IWebsocketMessage = {
                        uuid: uuidGenerator(),
                        payload: data,
                    };

                    if (connection.messageQueue.length > config.socketServerConfig.maxMessagesInQueue) {
                        const toDeleteMessageCount = connection.messageQueue.length - config.socketServerConfig.maxMessagesInQueue;
                        connection.messageQueue.splice(0, toDeleteMessageCount);
                        logger.warn(`message queue was over max messages for user ${connection.uuid} => deleted first ${toDeleteMessageCount} messages`);
                    }

                    // push socket message to message queue
                    connection.messageQueue.push(socketMessage);

                    // try to send the whole queue
                    // TODO: outsource or make smarter maybe??
                    for (let i = 0; i < connection.messageQueue.length; i += 1) {
                        const message = connection.messageQueue[i];
                        connection.socket.emit(`sensorData`, message);
                        logger.info(`sensorData: ${message.uuid}`);
                    }
                }
            } else {
                logger.info(`Can not send sensorData => ${this.connections.length} client(s) connected.`);
            }
        } else {
            logger.error(`Connections was undefined`);
        }
    }
}

export const socketService = new SocketService();
