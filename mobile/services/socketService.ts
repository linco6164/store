import { io, Socket } from "socket.io-client";
import * as SecureStore from "expo-secure-store";

const API_URL =
    process.env.EXPO_PUBLIC_API_URL;

class SocketService {
    private socket: Socket | null = null;

    async connect() {
        if (this.socket?.connected) {
            return this.socket;
        }

        if (!API_URL) {
            throw new Error(
                "EXPO_PUBLIC_API_URL nu este configurat."
            );
        }

        const token =
            await SecureStore.getItemAsync(
                "nexora_access_token"
            );

        if (!token) {
            throw new Error(
                "Nu există un token de autentificare."
            );
        }

        this.socket = io(API_URL, {
            transports: ["websocket"],
            auth: {
                token,
            },
            autoConnect: true,
        });

        return new Promise<Socket>(
            (resolve, reject) => {
                if (!this.socket) {
                    reject(
                        new Error(
                            "Socket nu a putut fi creat."
                        )
                    );
                    return;
                }

                this.socket.once(
                    "connect",
                    () => {
                        console.log(
                            "Socket connected:",
                            this.socket?.id
                        );

                        resolve(
                            this.socket!
                        );
                    }
                );

                this.socket.once(
                    "connect_error",
                    (error) => {
                        console.error(
                            "Socket connection error:",
                            error
                        );

                        reject(error);
                    }
                );
            }
        );
    }

    getSocket() {
        return this.socket;
    }

    async disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    async emit(
        event: string,
        ...args: unknown[]
    ) {
        const socket =
            await this.connect();

        socket.emit(
            event,
            ...args
        );
    }

    async on(
        event: string,
        callback: (...args: any[]) => void
    ) {
        const socket =
            await this.connect();

        socket.on(
            event,
            callback
        );

        return () => {
            socket.off(
                event,
                callback
            );
        };
    }

    off(
        event: string,
        callback?: (...args: any[]) => void
    ) {
        this.socket?.off(
            event,
            callback
        );
    }
}

export const socketService =
    new SocketService();