import { diffChars } from "diff";

function diffCharsToChangeSpec(oldText, newText) {
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
                pos += part.count
            }
        }

        return changes;
}

console.log(diffCharsToChangeSpec(process.argv[2], process.argv[3]));