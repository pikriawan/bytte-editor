import Watcher from "./watcher.js";

export default class Client {
    /**
     * @type {Object}
     */
    socket;

    /**
     * @type {Map}
     */
    watchers;

    /**
     * @param {Object} socket
     */
    constructor(socket) {
        this.socket = socket;
        this.watchers = new Map();

        this.onWatch = this.onWatch.bind(this);
        this.onUnwatch = this.onUnwatch.bind(this);
        this.onDisconnect = this.onDisconnect.bind(this);

        this.socket.on("watch", this.onWatch);
        this.socket.on("unwatch", this.onUnwatch);
        this.socket.on("disconnect", this.onDisconnect);
    }

    /**
     * @param {string} path
     * @returns {undefined}
     */
    onWatch(path) {
        const watcher = new Watcher(this.socket, path);
        this.watchers.set(path, watcher);
    }

    /**
     * @param {string} path
     * @returns {undefined}
     */
    onUnwatch(path) {
        const watcher = this.watchers.get(path);
        watcher.destroy();
        this.watchers.delete(path);
    }

    /**
     * @returns {undefined}
     */
    onDisconnect() {
        this.socket.removeListener("watch", this.onWatch);
        this.socket.removeListener("unwatch", this.onUnwatch);
        this.socket.removeListener("disconnect", this.onDisconnect);
    }
}
