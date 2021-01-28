import { getLogger } from 'log4js';
import { Server as HttpServer } from 'http';
import SocketIO, { Server as SocketIOServer } from 'socket.io';
import { v4 as uuidGenerator } from 'uuid';

import { IWebsocketConnection, IWebsocketMessage, IWebsocketResponse } from '../interfaces/socket-service';
import { ISensorData } from "../interfaces/socket-payload";
import Store from '../store/Store';

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
        // setInterval(() => this.sendTestData(), 5000);
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
                                Store.SimDataSubject.next({
                                    sun: responseData.sun,
                                    wind: responseData.wind,
                                    energyBalance: responseData.energyBalance,
                                });
                                logger.debug(JSON.stringify(responseData));
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

    // Use this if you want to send test data

    // private sendTestData() {
    //     const moduleOne: IModule = {
    //         sector: `One`,
    //         sensorOutside: this.getRandomInt(100, 400),
    //         sensorInside: this.getRandomInt(100, 400),
    //         pumpLevel: this.getRandomInt(-100, 100),
    //     };
    //     const moduleTwo: IModule = {
    //         sector: `Two`,
    //         sensorOutside: this.getRandomInt(100, 400),
    //         sensorInside: this.getRandomInt(100, 400),
    //         pumpLevel: this.getRandomInt(-100, 100),
    //     };
    //     const moduleThree: IModule = {
    //         sector: `Three`,
    //         sensorOutside: this.getRandomInt(100, 400),
    //         sensorInside: this.getRandomInt(100, 400),
    //         pumpLevel: this.getRandomInt(-100, 100),
    //     };
    //
    //     const sensorData: ISensorData = {
    //         timestamp: Date.now(),
    //         modules: [moduleOne, moduleTwo, moduleThree],
    //     };
    //     this.sendSensorData(sensorData);
    // }
    //
    // private getRandomInt(min: number, max: number) {
    //     // eslint-disable-next-line no-param-reassign
    //     min = Math.ceil(min);
    //     // eslint-disable-next-line no-param-reassign
    //     max = Math.floor(max);
    //     return Math.round(Math.floor(Math.random() * (max - min)) + min);
    // }
}

export const socketService = new SocketService();
