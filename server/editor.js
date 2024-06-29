import FileWatcher from "./file-watcher.js";

export default class Editor {
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

        this.watchFile = this.watchFile.bind(this);
        this.unwatchFile = this.unwatchFile.bind(this);
        this.destroy = this.destroy.bind(this);

        this.socket.on("watchFile", this.watchFile);
        this.socket.on("unwatchFile", this.unwatchFile);
        this.socket.on("disconnect", this.destroy);

        this.destroy = this.destroy.bind(this);
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

        this.socket.removeListener("watchFile", this.watchFile);
        this.socket.removeListener("unwatchFile", this.unwatchFile);
        this.socket.removeListener("disconnect", this.destroy);

        this.socket = null;
    }
}
