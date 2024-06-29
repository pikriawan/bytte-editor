import { Server } from "socket.io";
import Editor from "./editor.js";

const io = new Server();

io.on("connection", (socket) => {
    const editor = new Editor(socket);
});

export default io;
