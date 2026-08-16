import { io, Socket } from "socket.io-client";
import * as SecureStore from "expo-secure-store";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const TOKEN_KEY = "nexora_access_token";

class SocketService {
    private socket: Socket | null = null;
    private connecting: Promise<Socket> | null = null;

    async connect(): Promise<Socket> {
        if (this.socket?.connected) {
            return this.socket;
        }

        if (this.connecting) {
            return this.connecting;
        }

        if (!API_URL) {
            throw new Error(
                "EXPO_PUBLIC_API_URL nu este configurat."
            );
        }

        const token =
            await SecureStore.getItemAsync(
                TOKEN_KEY
            );

        if (!token) {
            throw new Error(
                "Nu există un token de autentificare."
            );
        }

        this.connecting = new Promise<Socket>(
            (resolve, reject) => {
                const socket = io(API_URL, {
                    transports: ["websocket"],
                    auth: {
                        token,
                    },
                    autoConnect: false,
                });

                this.socket = socket;

                const cleanup = () => {
                    socket.off("connect", handleConnect);
                    socket.off(
                        "connect_error",
                        handleConnectError
                    );
                };

                const handleConnect = () => {
                    cleanup();

                    console.log(
                        "Socket connected:",
                        socket.id
                    );

                    resolve(socket);
                };

                const handleConnectError = (
                    error: Error
                ) => {
                    cleanup();

                    console.error(
                        "Socket connection error:",
                        error
                    );

                    socket.disconnect();

                    if (this.socket === socket) {
                        this.socket = null;
                    }

                    reject(error);
                };

                socket.once(
                    "connect",
                    handleConnect
                );

                socket.once(
                    "connect_error",
                    handleConnectError
                );

                socket.connect();
            }
        );

        try {
            return await this.connecting;
        } finally {
            this.connecting = null;
        }
    }

    getSocket(): Socket | null {
        return this.socket;
    }

    isConnected(): boolean {
        return this.socket?.connected ?? false;
    }

    async disconnect(): Promise<void> {
        if (!this.socket) {
            return;
        }

        this.socket.removeAllListeners();
        this.socket.disconnect();
        this.socket = null;
        this.connecting = null;

        console.log("Socket disconnected");
    }

    async emit(
        event: string,
        ...args: unknown[]
    ): Promise<void> {
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
    ): Promise<() => void> {
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
    ): void {
        this.socket?.off(
            event,
            callback
        );
    }
}

export const socketService =
    new SocketService();