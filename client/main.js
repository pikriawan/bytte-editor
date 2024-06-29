import { io } from "socket.io-client";

const socket = io();

socket.on("connect", () => {
    socket.emit("watchFile", "index.txt");
});
