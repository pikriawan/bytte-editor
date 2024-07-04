import fs from "node:fs";
import W from "watcher";

export default class Watcher {
    /**
     * @type {Object}
     */
    socket;

    /**
     * @type {string}
     */
    path;

    /**
     * @type {Object[]}
     */
    updates;

    /**
     * @type {Object}
     */
    watcher;

    /**
     * @param {Object} socket
     * @param {string} path
     */
    constructor(socket, path) {
        this.socket = socket;
        this.path = path;
        this.updates = [];

        this.onChange = this.onChange.bind(this);
        this.onUnlink = this.onUnlink.bind(this);
        this.onPull = this.onPull.bind(this);
        this.onPush = this.onPush.bind(this);

        this.socket.on("pull", this.onPull);
        this.socket.on("push", this.onPush);
    }

    /**
     * @returns {undefined}
     */
    watch() {
        this.watcher = new W(this.path, {
            ignoreInitial: true
        });

        this.watcher.on("change", this.onChange);
        this.watcher.on("unlink", this.onUnlink);
    }

    /**
     * @returns {undefined}
     */
    destroy() {
        this.watcher.close();

        this.socket.removeListener("pull", this.onPull);
        this.socket.removeListener("push", this.onPush);
    }

    /**
     * @returns {Object}
     */
    getLatestUpdate() {
        return this.updates.at(-1);
    }

    /**
     * @returns {string}
     */
    read() {
        return fs.readFileSync(this.path, "utf-8");
    }

    /**
     * @returns {undefined}
     */
    write() {
        fs.writeFileSync(this.path, this.getLatestUpdate().data);
    }

    /**
     * @returns {undefined}
     */
    onChange() {
        if (this.getLatestUpdate().data !== this.read()) {
            this.updates.push({
                version: this.getLatestUpdate().version + 1,
                data: this.read()
            });
        }

        this.socket.emit("change", this.path, this.getLatestUpdate());
    }

    /**
     * @returns {undefined}
     */
    onUnlink() {
        this.socket.emit("unlink", this.path);
    }

    /**
     * @returns {undefined}
     */
    onPull() {
        this.socket.emit("pull", this.path, this.getLatestUpdate());
    }

    /**
     * @returns {undefined}
     */
    onPush(path, data) {
        if (path !== this.path) {
            return;
        }

        this.updates.push({
            version: this.getLatestUpdate().version + 1,
            data
        });

        this.write();
    }
}
