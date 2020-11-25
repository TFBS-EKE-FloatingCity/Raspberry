import { Socket } from 'socket.io';

export interface IWebsocketConnection {
    uuid: string;
    socket: Socket;
}
