import { Server } from "socket.io";

import registerChatSocket from "./chat.socket.js";

export default function registerSockets(io: Server) {
    registerChatSocket(io);
}