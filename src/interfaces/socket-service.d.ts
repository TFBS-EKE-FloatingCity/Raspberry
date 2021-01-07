import { Socket } from 'socket.io';
import {ISocketSimulationData} from './socket-payload';

export interface IWebsocketConnection {
    uuid: string;
    socket: Socket;
    messageQueue: IWebsocketMessage[];
}

export interface IWebsocketMessage {
    uuid: string;
    payload: any;
}

export interface IWebsocketResponse extends ISocketSimulationData {
    status: 'ack' | 'error';
    id: string;
}