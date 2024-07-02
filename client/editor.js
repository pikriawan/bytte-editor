export default class Editor {
    /**
     * @type {Object}
     */
    socket;

    /**
     * @type {Object[]}
     */
    updates = [];

    /**
     * @function
     */
    debounce;

    /**
     * @type {number}
     */
    debounceDelay = 1000;

    /**
     * @type {HTMLElement}
     */
    $;

    /**
     * @type {HTMLElement}
     */
    $editor;

    /**
     * @type {HTMLElement}
     */
    $destroy;

    constructor(socket, parent, path) {
        this.socket = socket;
        this.path = path;

        this.onPull = this.onPull.bind(this);
        this.onInput = this.onInput.bind(this);
        this.destroy = this.destroy.bind(this);

        this.$ = document.createElement("div");

        this.$editor = document.createElement("textarea");
        this.$editor.oninput = (event) => {
            this.onInput(event.target.value);
        }

        this.$destroy = document.createElement("button");
        this.$destroy.textContent = "Destroy";
        this.$destroy.onclick = this.destroy;

        this.$.append(this.$editor, this.$destroy);
        parent.append(this.$);

        this.socket.emit("watch", this.path);

        this.socket.on("pull", this.onPull);
    }

    /**
     * @returns {Object}
     */
    getLatestUpdate() {
        return this.updates.at(-1);
    }

    /**
     * @param {string} data
     * @returns {undefined}
     */
    push(data) {
        this.updates.push({
            version: this.getLatestUpdate().version + 1,
            data
        });

        this.socket.emit("push", this.path, data);
    }

    /**
     * @param {string} path
     * @param {string,} data
     * @returns {undefined}
     */
    onPull(path, data) {
        if (path !== this.path) {
            return;
        }

        if (!this.updates.some((update) => update.version === data.version && update.data === data.data)) {
            this.updates.push(data);
            this.$editor.textContent = data.data;
        }
    }

    /**
     * @param {string} data
     * @returns {undefined}
     */
    onInput(data) {
        clearTimeout(this.debounce);

        this.debounce = setTimeout(() => {
            this.push(data);
        }, this.debounceDelay);
    }

    /**
     * @returns {undefined}
     */
    destroy() {
        this.socket.emit("unwatch", this.path);
        this.socket.off("pull", this.onPull);

        this.$.remove();
    }
}
