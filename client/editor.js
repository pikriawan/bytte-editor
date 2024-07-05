export default class Editor {
    /**
     * @type {Object}
     */
    socket;

    /**
     * @type {HTMLElement}
     */
    $parent;

    /**
     * @type {string}
     */
    path;

    /**
     * @type {Object[]}
     */
    updates;

    /**
     * @type {number}
     */
    debounceDelay;

    /**
     * @function
     */
    debounce;

    /**
     * @param {Object} socket
     * @param {HTMLElement} $parent
     * @param {string} path
     * @param {number} debounceDelay
     */
    constructor(socket, $parent, path, debounceDelay = 1000) {
        this.socket = socket;
        this.$parent = $parent;
        this.path = path;
        this.debounceDelay = debounceDelay;
        this.updates = [];

        this.socket.emit("watch", this.path);
        this.socket.emit("pull", this.path);

        this.destroy = this.destroy.bind(this);
        this.onInput = this.onInput.bind(this);
        this.onPull = this.onPull.bind(this);
        this.onConnect = this.onConnect.bind(this);
        this.onDisconnect = this.onDisconnect.bind(this);

        this.socket.on("pull", this.onPull);
        this.socket.on("connect", this.onConnect);
        this.socket.on("disconnect", this.onDisconnect)

        this.$ = document.createElement("div");

        this.$editor = document.createElement("textarea");
        this.$editor.addEventListener("input", this.onInput);

        this.$destroy = document.createElement("button");
        this.$destroy.textContent = "Destroy";
        this.$destroy.addEventListener("click", this.destroy);

        this.$.append(this.$editor, this.$destroy);
        this.$parent.append(this.$);
    }

    /**
     * @returns {undefined}
     */
    destroy() {
        clearInterval(this.debounce);

        this.socket.off("pull", this.onPull);
        this.socket.off("connect", this.onConnect);
        this.socket.off("disconnect", this.onDisconnect);

        this.$.remove();
    }

    /**
     * @returns {undefined}
     */
    onConnect() {
        console.log("connected");

        this.socket.emit("watch", this.path);
        this.socket.emit("pull", this.path);
    }

    /**
     * @returns {undefined}
     */
    onDisconnect() {
        console.log("disconnected");
    }

    /**
     * @returns {Object}
     */
    getLatestUpdate() {
        return this.updates.at(-1) || { version: 0 };
    }

    /**
     * @returns {undefined}
     */
    push(data) {
        console.log(data);

        this.updates.push({
            version: this.getLatestUpdate().version + 1,
            data
        });

        this.socket.emit("push", this.path, data);
    }

    /**
     * @param {Event} event
     * @returns {undefined}
     */
    onInput(event) {
        clearInterval(this.debounce);

        this.debounce = setTimeout(() => this.push(event.target.value), this.debounceDelay);
    }

    /**
     * @param {string} path
     * @param {Object} update
     * @returns {undefined}
     */
    onPull(path, update) {
        if (path !== this.path) {
            return;
        }

        if (this.updates.some((u) => u.version === update.version && u.data === update.data)) {
            return;
        }

        this.updates.push(update);
        this.$.value = update.data;
    }
}
