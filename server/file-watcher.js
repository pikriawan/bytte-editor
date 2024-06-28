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

    constructor(explorer, filePath) {
        this.explorer = explorer;
        this.filePath = filePath;

        this.watcher = new Watcher();
    }
}
