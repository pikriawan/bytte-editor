import FileWatcher from "./file-watcher.js";

class Editor {
    /**
     * @type {Object}
     */
    socket;

    /**
     * @type {Map}
     */
    fileWatchers = new Map();

    constructor(socket) {
        this.socket = socket;
    }

    /**
     * @param {string} filePath
     * @returns {undefined}
     */
    watchFile(filePath) {
        const fileWatcher = new FileWatcher(this, filePath);
        fileWatcher.watchFile();
        this.fileWatchers.set(filePath, fileWatcher);
    }

    /**
     * @param {string} filePath
     * @returns {undefined}
     */
    unwatchFile(filePath) {
        const fileWatcher = this.fileWatchers.get(filePath);
        fileWatcher.unwatchFile();
        fileWatcher.destroy();
        this.fileWatchers.delete(filePath);
    }

    /**
     * @returns {undefined}
     */
    destroy() {
        this.fileWatchers.forEach((fileWatcher) => {
            fileWatcher.unwatchFile();
            fileWatcher.destroy();
        });

        this.fileWatchers = null;
        this.socket = null;
    }
}
