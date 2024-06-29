import fs from "node:fs";
import Watcher from "watcher";

export default class Editor {
    /**
     * @type {Object}
     */
    client;

    /**
     * @type {string}
     */
    path;

    /**
     * @type {Object}
     */
    watcher;

    /**
     * @type {Object[]}
     */
    updates = [];

    constructor(client, path) {
        this.client = client;
        this.path = path;

        this.onPush = this.onPush.bind(this);

        this.onChange = this.onChange.bind(this);
        this.onUnlink = this.onUnlink.bind(this);
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
     * @param {string} data
     * @returns {undefined}
     */
    onPush(data) {
        this.updates.push({
            version: this.getLatestUpdate().version + 1,
            data
        });

        this.write();
    }

    /**
     * @returns {undefined}
     */
    onChange() {
        if (this.read() !== this.getLatestUpdate().data) {
            this.updates.push({
                version: this.getLatestUpdate().version + 1,
                data: this.read()
            });
        }

        this.client.socket.emit("pull", this.path, this.getLatestUpdate());
    }

    /**
     * @returns {undefined}
     */
    onUnlink() {
        this.client.socket.emit("unlink", this.path);

        this.unwatch();
        this.destroy();
    }

    /**
     * @returns {undefined}
     */
    watch() {
        this.watcher = new Watcher(this.path, {
            ignoreInitial: true
        });

        this.updates.push({
            version: 0,
            data: this.read()
        });

        this.client.socket.emit("pull", this.path, this.getLatestUpdate());

        this.client.socket.on("push", this.onPush);

        this.watcher.on("change", this.onChange);
        this.watcher.on("unlink", this.onUnlink);
    }

    /**
     * @returns {undefined}
     */
    unwatch() {
        this.watcher.close();
    }

    /**
     * @returns {undefined}
     */
    destroy() {
        this.client.socket.removeListener("push", this.onPush);

        this.client = null;
        this.path = null;
        this.watcher = null;
        this.updates = null;
    }
}
