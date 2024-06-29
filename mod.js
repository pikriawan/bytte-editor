import fs from "node:fs";

setInterval(() => {
    fs.writeFileSync("./index.txt", fs.readFileSync("./index.txt", "utf-8") + ".");
}, 500);
