import { getLogger } from 'log4js';
import { Server as HttpServer } from 'http';
import SocketIO, { Server as SocketIOServer, Socket } from 'socket.io';
import { v4 as uuidGenerator } from 'uuid';

import { IWebsocketConnection } from '../interfaces/socket-service';
import {ISocketSensorData} from "../interfaces/socket-payload";

const logger = getLogger('socket-service');

class SocketService {
    // @ts-ignore
    socketIOServer: SocketIOServer;

    connections: IWebsocketConnection[] = [];

    public start(server: HttpServer) {
        this.socketIOServer = new SocketIO(server);
        this.socketIOServer.on('connect', (socket) => {
            const uuid = uuidGenerator();
            logger.info(`new client try's to connect`)
            socket.on('authenticate', () => {
                // TODO: Authenticate ??
                this.connections.push({
                    uuid: uuid,
                    socket: socket
                })
                logger.info(`new client ${uuid} is connected. ${this.connections.length} client(s) now connected.`)
            });
            socket.once('disconnect', () => {
                logger.info(`client ${uuid} is disconnecting`);
                this.connections.splice(this.connections.findIndex(c => c.uuid === uuid), 1);
                logger.info(`client disconnected. ${this.connections.length} client(s) now connected.`);
            });
        });
        setInterval(this.sendTestData, 5000);
    }

    private sendTestData() {
        logger.info(`try send test data`)
        if (this.connections && this.connections.length > 0) {
            logger.info(`send test data`)
            for (const connection of this.connections) {
                logger.info(`send test data to ${connection.uuid}`)
                connection.socket.emit('senorData', {test: "Das ist eine Test JSON"})
            }
        }
    }

    public sendSensorData(data: ISocketSensorData) {
        if (this.connections && this.connections.length > 0) {
            for (const connection of this.connections) {
                connection.socket.emit('senorData', data)
            }
        } else {
            console.info(`Can not send sensorData => ${this.connections.length} client(s) connected.`)
        }
    }

    public sendTestObject() {
        for (const connection of this.connections) {
            connection.socket.emit('testData', {
                data: 'works!!'
            })
        }
    }
}

export const socketService = new SocketService();
