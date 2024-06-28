import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { createServer as createViteServer } from "vite";
import io from "./io.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function createServer() {
    const app = express();
    const server = http.createServer(app);
    io.attach(server);

    const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "custom"
    });

    app.use(vite.middlewares);

    app.use(express.static(path.resolve(__dirname, "../client")));

    server.listen(3000);
}

createServer();
