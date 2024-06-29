import fs from "node:fs";
import Watcher from "watcher";

export default class FileWatcher {
    /**
     * @type {Object}
     */
    explorer;

    /**
     * @type {string}
     */
    filePath;

    /**
     * @type {Object}
     */
    watcher;

    /**
     * @type {Object[]}
     */
    updates = [];

    /**
     * @type {number}
     */
    version = 0;

    /**
     * @type {string}
     */
    data;

    constructor(explorer, filePath) {
        this.explorer = explorer;
        this.filePath = filePath;

        this.onChange = this.onChange.bind(this);
        this.onUnlink = this.onUnlink.bind(this);
    }

    /**
     * @returns {undefined}
     */
    onChange() {
        console.log("event: change, filePath: %s", this.filePath);
    }

    /**
     * @returns {undefined}
     */
    onUnlink() {
        console.log("event: unlink, filePath: %s", this.filePath);
    }

    /**
     * @returns {undefined}
     */
    watchFile() {
        this.watcher = new Watcher(this.filePath, {
            ignoreInitial: true,
            recursive: false
        });

        this.watcher.on("change", this.onChange);
        this.watcher.on("unlink", this.onUnlink);
    }

    unwatchFile() {
        this.watcher.close();
    }

    destroy() {
        this.explorer = null;
        this.filePath = null;
        this.watcher = null;
        this.updates = null;
        this.version = null;
        this.data = null;
    }
}
