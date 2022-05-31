import { io, Socket } from "socket.io-client";
import ChatListener from "./chat_listener";

export default class ChatService {

    private socket: Socket;
    private listeners: ChatListener[] = [];

    constructor() {
        // TODO add support for environment variables
        //const serverHost: string = process.env.CHAT_HOST || 'http://localhost';
        //const serverHost = 'http://localhost:3000';
        const serverHost = 'http://192.168.1.52:3000';
        this.socket = io(serverHost);
        this.listenToNewMessages();
    }

    registerListener(listener: ChatListener) {
        this.listeners.push(listener)
    }

    registerUser(username: string): void {
        this.socket.emit('add user', username);
    }

    sendMesage(message: string): void {
        // TODO in the future we want to specify to which channel the message will be sent
        this.socket.emit('new message', message);
    }

    private listenToNewMessages(): void {
        this.socket.on('new message', (data: any) => {
            // TODO some possible validations, prevent code injections!
            for (let listener of this.listeners) {
                listener.onMessage(data);
            }
        });
    }
}
