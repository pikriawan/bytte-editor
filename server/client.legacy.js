import Editor from "./editor.js";

export default class Client {
    /**
     * @type {Object}
     */
    socket;

    /**
     * @type {Map}
     */
    editors = new Map();

    constructor(socket) {
        this.socket = socket;

        this.watch = this.watch.bind(this);
        this.unwatch = this.unwatch.bind(this);
        this.destroy = this.destroy.bind(this);

        this.socket.on("watch", this.watch);
        this.socket.on("unwatch", this.unwatch);
    }

    /**
     * @param {string} path
     * @returns {undefined}
     */
    watch(path) {
        const editor = new Editor(this, path);
        editor.watch();
        this.editors.set(path, editor);
    }

    /**
     * @param {string} path
     * @returns {undefined}
     */
    unwatch(path) {
        const editor = this.editors.get(path);
        editor.destroy();
        this.editors.delete(path);
    }

    /**
     * @returns {undefined}
     */
    destroy() {
        this.editors.forEach((editor) => {
            editor.destroy();
        });

        this.socket.removeListener("watch", this.watch);
        this.socket.removeListener("unwatch", this.unwatch);
    }
}
