import { Server } from "socket.io";
import Client from "./client.js";

const io = new Server();

io.on("connection", (socket) => {
    const client = new Client(socket);
});

export default io;
