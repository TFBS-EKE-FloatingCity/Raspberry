import { Socket } from 'socket.io';

export interface IWebsocketConnection {
    uuid: string;
    socket: Socket;
    messageQueue: IWebsocketMessage[];
}

export interface IWebsocketMessage {
    uuid: string;
    payload: any;
}

export interface IWebsocketResponse {
    status: 'ack' | 'error';
    id: string;
}