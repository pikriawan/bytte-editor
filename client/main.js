import { io } from "socket.io-client";
import Editor from "./editor";

const socket = io();

const $form = document.createElement("form");
$form.onsubmit = (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const path = formData.get("path");
    new Editor(socket, document.body, path));

    event.target.reset();
}

const $input = document.createElement("input");
$input.name = "path";

const $submit = document.createElement("button");
$submit.textContent = "Open folder";

$form.append($input, $submit);
document.body.append($form);
