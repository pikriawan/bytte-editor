import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { diffChars } from "diff";

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
     * @type {Object}
     */
    state;

    /**
     * @type {Object}
     */
    view;

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
        this.onPull = this.onPull.bind(this);
        this.onConnect = this.onConnect.bind(this);
        this.onDisconnect = this.onDisconnect.bind(this);

        this.socket.on("pull", this.onPull);
        this.socket.on("connect", this.onConnect);
        this.socket.on("disconnect", this.onDisconnect)

        this.state = EditorState.create({
            extensions: [
                EditorView.updateListener.of((viewUpdate) => {
                    if (viewUpdate.docChanged) {
                        this.onInput(viewUpdate.state.doc.toString());
                    }
                })
            ]
        });

        this.view = new EditorView({
            state: this.state,
            parent: this.$parent
        });
    }

    /**
     * @returns {undefined}
     */
    destroy() {
        clearInterval(this.debounce);

        this.socket.off("pull", this.onPull);
        this.socket.off("connect", this.onConnect);
        this.socket.off("disconnect", this.onDisconnect);

        this.view.destroy();
    } 

    /**
     * @returns {Object}
     */
    getLatestUpdate() {
        return this.updates.at(-1) || {
            version: 0,
            data: ""
        };
    }

    /**
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
     * @param {string} oldText
     * @param {string} newText
     * @returns {Object[]}
     */
    diffCharsToChangeSpec(oldText, newText) {
        console.log("oldText: ", oldText);
        console.log("newText: ", newText);

        const diff = diffChars(oldText, newText);
        const changes = [];
        let pos = 0;

        for (const part of diff) {
            if (part.added) {
                changes.push({
                    from: pos,
                    insert: part.value
                });
                pos += part.count
            } else if (part.removed) {
                changes.push({
                    from: pos,
                    to: pos + part.count
                });
            } else {
                pos += part.count;
            }
        }

        return changes;
    }

    /**
     * @param {string} data
     * @returns {undefined}
     */
    onInput(data) {
        clearInterval(this.debounce);

        this.debounce = setTimeout(() => this.push(data), this.debounceDelay);
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

        const changeSpec = this.diffCharsToChangeSpec(this.getLatestUpdate().data, update.data);

        for (const changes of changeSpec) {
            this.view.dispatch({ changes });
        }

        this.updates.push(update);
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
}
